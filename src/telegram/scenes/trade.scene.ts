import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { UtilsService } from '../service/utils/utils.service';
import { TextService } from '../service/text/text.service';
import { SolanaService } from '../../providers/solana/solana.service';
import { UserRepository } from '../../db/repository/user.repository';
import { SettingsRepository } from '../../db/repository/settings.repository';
import { JupiterService } from '../../providers/jupiter/jupiter.service';
import { TransactionRepository } from '../../db/repository/transaction.repository';
import constants from '@shared/constants';
import { ReferralRepository } from '../../db/repository/referral.repository';
import { SellActions, TransactionType } from '@shared/enums';
import { isBase58 } from 'class-validator';
import { ImageService } from '../service/utils/image.service';
import { ShyftApiService } from '../../providers/shyft/shyft-api.service';
import { Connection, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import { JupiterAPI } from '../../providers/jupiter/jupiterAPI';
import { JitoService } from '../../providers/jito/jito.service';
import { DexscreenerService } from '../../providers/dexscreener/dexscreener.service';
import { TokenDetailsService } from '../service/token-details/token-details.service';
import { TransactionContext, User, SendTransactionResponse, TradeDetails } from '../types/types';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { ConfigService } from '@nestjs/config';

@Wizard('trade')
export class TradeWizard {
  private readonly logger = new Logger(this.constructor.name);
  private readonly connection: Connection;

  constructor(
    private readonly i18n: I18nService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly utilsService: UtilsService,
    private readonly textService: TextService,
    private readonly solanaService: SolanaService,
    private readonly userService: UserRepository,
    private readonly settingsService: SettingsRepository,
    private readonly jupiterService: JupiterService,
    private readonly transactionService: TransactionRepository,
    private readonly referralService: ReferralRepository,
    private readonly shyftApiService: ShyftApiService,
    private readonly imageService: ImageService,
    private readonly jupiterAPI: JupiterAPI,
    private readonly jitoService: JitoService,
    private readonly dexscreenerService: DexscreenerService,
    private readonly tokenService: TokenDetailsService,
    private configService: ConfigService,
  ) {
    const heliusRpcUrl = this.configService.get<string>('blockchain.solana.rpcUrl');
    this.connection = new Connection(heliusRpcUrl, { commitment: 'confirmed' });
  }

  @WizardStep(0)
  async requestTokenAddress(ctx) {
    this.logger.debug('~~~ Requesting Token Address ~~~');
    if (await this.handleCommand(ctx)) {
      return;
    }

    // Log current state
    this.logger.debug('Current scene state before checking token:', ctx.scene.state);

    if (ctx.scene.state.token) {
      this.logger.debug('Token found in state:', ctx.scene.state.token);
      await this.handleTokenAddress(ctx);
    } else {
      const message = this.i18n.translate('i18n.input_messages.solana_token');
      const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
      this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
      ctx.wizard.selectStep(1);
      this.logger.debug('Step 1 selected, waiting for user to input token address.');
    }
  }

  @WizardStep(1)
  async handleTokenAddress(ctx) {
    this.logger.debug('~~~ Handling Token Address ~~~');
    if (await this.handleCommand(ctx)) {
      return;
    }

    const user = await this.userService.getUserByTelegramId(ctx.from.id);
    const hasSufficientBalance = await this.solanaService.checkUserSolBalance(user.walletAddress);

    this.logger.debug('User wallet address:', user.walletAddress);
    this.logger.debug('User has sufficient balance:', hasSufficientBalance);

    if (!hasSufficientBalance) {
      const message = this.i18n.translate('i18n.error_messages.insufficient_balance');
      await this.textService.sendErrorMessage(ctx, message);
      ctx.scene.leave();
      return;
    }

    const userInput = ctx.message?.text?.trim();
    const tokenAddress = userInput && isBase58(userInput) ? userInput : ctx.scene.state.token;

    this.logger.debug(`User input: ${userInput}`);
    this.logger.debug('Token address received:', tokenAddress);

    if (!tokenAddress || !isBase58(tokenAddress)) {
      await this.textService.sendErrorMessage(ctx, 'Invalid token address provided. Please enter a valid Solana token address.');
      this.logger.debug('Invalid token address provided');
      return;
    }

    const validationResult = await this.solanaService.validateSolanaTokenAddress(tokenAddress);
    if (validationResult.errorMessage) {
      await this.textService.sendErrorMessage(ctx, validationResult.errorMessage);
      this.logger.debug(`Token validation error: ${validationResult.errorMessage}`);
      return;
    }

    ctx.scene.state.token = tokenAddress;
    await this.processTokenAddress(ctx, tokenAddress);
    ctx.wizard.selectStep(2);
  }

  private async processTokenAddress(ctx, tokenAddress: string) {
    this.logger.debug(`Processing token address: ${tokenAddress}`);
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);

    const tradeDetails = await this.tokenService.getTokenDetailsForTrade(tokenAddress, user, settings);
    const tokenMetadata = await this.solanaService.getTokenMetadata(tokenAddress);
    const tokenSymbol = tokenMetadata.json?.symbol.toUpperCase();

    await this.sendTradeDetails(ctx, tradeDetails, user, settings);
  }

  private async sendTradeDetails(ctx, tradeDetails, user, settings) {
    this.logger.debug('Sending trade details');
    const transactionRecord = await this.transactionService.getInitialTransaction(user.id, tradeDetails.token_address);
    tradeDetails.initial_token_amount = transactionRecord ? transactionRecord.amountTokens : '0';

    let tokenTemplate;
    if (ctx.scene.state.token) {
      tokenTemplate = this.i18n.translate('i18n.buy_from_alert', { args: tradeDetails });
    } else {
      tokenTemplate = this.i18n.translate('i18n.trade_token_info', { args: tradeDetails });
    }

    const walletTemplate = this.i18n.translate('i18n.trading_wallet_info', { args: tradeDetails });
    const combinedTemplate = `${tokenTemplate}\n${walletTemplate}`;
    const buttons = await this.markupButtonsService.tradeButtons(settings, tradeDetails.initial_token_amount);
    await this.textService.sendMessageWithButtonsWithPreview(ctx, combinedTemplate, buttons);
    this.logger.debug('Trade details sent with buttons');
  }

  @WizardStep(2)
  async handleUserReply(ctx) {
    this.logger.debug('~~~ Trade scene: step 2~~~');
    if (await this.handleCommand(ctx)) {
      return;
    }
    if (!ctx.scene.state.token) {
      const errorMsg = this.i18n.translate('i18n.input_messages.token_not_found');
      await this.textService.sendErrorMessage(ctx, errorMsg);
      this.logger.debug('Token not found in state');
      return;
    }

    const inputValue = ctx.message?.text?.trim();
    if (!inputValue) {
      this.logger.debug('No input value received');
      return;
    }

    if (ctx.scene.state.actionType === 'buy_x_sol') {
      const { value, errorMessage } = this.utilsService.validatePositiveNumber(inputValue);
      if (errorMessage) {
        const errorMsg = this.i18n.translate(errorMessage);
        await this.textService.sendErrorMessage(ctx, errorMsg);
        this.logger.debug(`Validation error: ${errorMessage}`);
        const message = this.i18n.translate('i18n.input_messages.x_sol_buy');
        await this.handleUserInput(ctx, 'buy_x_sol', message);
        return;
      }

      this.logger.debug(`Amount to buy: ${value}`);
      this.logger.debug(`Current action type: ${ctx.scene.state.actionType}`);
      ctx.scene.state.amountSol = value;
      this.logger.debug(`Current action type: ${ctx.scene.state.actionType}`);
      await this.processTransaction(ctx, 'buy_x_sol', TransactionType.Buy);
    }
  }

  private async handleCommand(ctx): Promise<boolean> {
    return await this.utilsService.checkAndHandleCommand(
      ctx,
      () => this.startNewInstance(ctx),
      () => this.close(ctx),
    );
  }

  private async startNewInstance(ctx) {
    const message = this.i18n.translate('i18n.input_messages.solana_token');
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
    this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
    ctx.wizard.selectStep(1);
  }

  private async processTransaction(ctx, actionType: string, transactionType: string) {
    let txSignature;
    let transactionContext: TransactionContext;

    try {
      this.logger.debug(`Entering processTransaction`);
      transactionContext = await this.prepareTransactionContext(ctx, actionType, transactionType);

      if(transactionContext.user.Settings.mevProtection) {
        const result = await this.processWithBundle(transactionContext);
        if(!result.confirmed) {
          throw new Error('Token buying failed.');
        }
        txSignature = result.signature;
      } else {
        txSignature = await this.processWithoutBundle(transactionContext);
      }
    } catch (error) {
      await this.handleTransactionError(error, ctx);
    } finally {
      if (txSignature && transactionContext) {
        await this.finalizeTransaction(txSignature, transactionContext, ctx);
      }
      ctx.scene.state = {};
      await ctx.scene.leave();
    }
  }

  private async handleTransactionError(error, ctx) {
    if (error && error.level === 'warn') {
      this.logger.warn(`Non-critical error: ${error.message}`, error.stack);
    } else {
      this.logger.error(`Error during transaction: ${error.message}`, error.stack);
      const errorMessage = this.i18n.translate('i18n.error_messages.solana_swap_error');
      await this.textService.sendErrorMessage(ctx, errorMessage);
    }
  }

  private async processWithoutBundle(transactionContext: TransactionContext): Promise<string> {
    const swapResult = await this.jupiterService.sendSwapTransaction(
      transactionContext.wallet,
      transactionContext.inputTokenAddress,
      transactionContext.outputTokenAddress,
      transactionContext.adjustedAmountLamports,
      transactionContext.user.Settings.slippage,
      transactionContext.priorityFeeLamports,
    );

    const quote = await this.jupiterAPI.fetchQuote(
      transactionContext.inputTokenAddress,
      transactionContext.outputTokenAddress,
      transactionContext.adjustedAmountLamports,
      transactionContext.user.Settings.slippage,
      100,
    );
    await this.jupiterAPI.createSwapTransaction(transactionContext.wallet, quote, transactionContext.user.Settings.priorityFee);

    if (transactionContext.transactionType === TransactionType.Buy) {
      await this.solanaService.sendSolToRewardsWallet(
        transactionContext.fromSecretKey,
        transactionContext.developerFeeLamports,
      );

      if (transactionContext.referralWalletAddress) {
        const isBalanceSufficient = await this.solanaService.checkUserSolBalance(transactionContext.referralWalletAddress, 1250);

        if (isBalanceSufficient) {
          await this.solanaService.sendSolToReferralWallet(
            transactionContext.fromSecretKey,
            transactionContext.referralWalletAddress,
            transactionContext.referralFeeLamports,
          );
          this.logger.debug(`Referral reward of ${transactionContext.referralFeeLamports} sent to: ${transactionContext.referralWalletAddress}`);
        } else {
          this.logger.debug(`No referral reward sent: Insufficient balance on referral wallet ${transactionContext.referralWalletAddress}`);
        }
      } else {
        this.logger.debug(`No referral reward sent: No referral address`);
      }
    } else {
      this.logger.debug(`Skipping referral and developer fees for non-buy transaction.`);
    }
    this.logger.debug(`swapResult.txid: ${swapResult.txid}`);
    return swapResult.txid;
  }

  private async processWithBundle(transactionContext: TransactionContext): Promise<SendTransactionResponse> {
    const rewardAndReferInstructions: TransactionInstruction[] = [];
    const jitoTipAccount: PublicKey = this.jitoService.getRandomTipAccount();
    console.log(transactionContext);
    const quote = await this.jupiterAPI.fetchQuote(
        transactionContext.inputTokenAddress,
        transactionContext.outputTokenAddress,
        transactionContext.adjustedAmountLamports,
        transactionContext.user.Settings.slippage
      );
    if (!quote || !quote.routePlan?.[0]?.swapInfo) {
      throw new Error('Failed to fetch a valid swap quote.');
    }
    
    const jitoTipLamports = transactionContext.user.Settings.priorityFee * LAMPORTS_PER_SOL;

    const swapObj = await this.jupiterAPI.createSwapTransaction(transactionContext.wallet, quote, undefined, jitoTipLamports);
    if (!swapObj?.swapTransaction) {
      throw new Error('Failed to create a valid swap transaction.');
    }

    const message = this.solanaService.deserializeTransaction(swapObj.swapTransaction);
    const accountKeysFromLookups = await this.solanaService.resolveAddressLookups(message);
    const swapInstructions: TransactionInstruction[] = this.solanaService.createTransactionInstructions(message, accountKeysFromLookups);

    if (transactionContext.transactionType === TransactionType.Buy) {
      const isBalanceSufficientForDevFee = await this.solanaService.checkUserSolBalance(transactionContext.user.walletAddress, transactionContext.developerFeeLamports / LAMPORTS_PER_SOL );
      
      if(!isBalanceSufficientForDevFee) {
        throw new Error('Transaction Building Error: ')
      }

      rewardAndReferInstructions.push(
        await this.solanaService.sendSolToRewardsWalletForMev(
          transactionContext.user.walletAddress, 
          transactionContext.developerFeeLamports / LAMPORTS_PER_SOL
        )
      );

      if ( transactionContext.referralWalletAddress ) {
        const isBalanceSufficient = await this.solanaService.checkUserSolBalance(transactionContext.user.walletAddress, transactionContext.referralFeeLamports / LAMPORTS_PER_SOL);

        if (isBalanceSufficient) {
          rewardAndReferInstructions.push(await this.solanaService.sendSolToReferralWalletForMev(
            transactionContext.user.walletAddress,
            transactionContext.referralWalletAddress,
            transactionContext.referralFeeLamports / LAMPORTS_PER_SOL
          ));

          this.logger.debug(`Referral reward of ${transactionContext.referralFeeLamports / LAMPORTS_PER_SOL} SOL sent to: ${transactionContext.referralWalletAddress} from ${transactionContext.user.walletAddress}`);
        } else {
          this.logger.debug(`No referral reward sent: Insufficient balance on ${transactionContext.user.walletAddress}`);
        }
      } else {
        this.logger.debug(`No referral reward sent: No referral address`);
      }
    }

    rewardAndReferInstructions.unshift(
      await this.solanaService.createNativeTokenTransferTransaction(transactionContext.wallet.publicKey, jitoTipAccount, transactionContext.user.Settings.priorityFee)
    );

    const latestBlockhash = await this.connection.getLatestBlockhash();
    
    const swapVersionedTransaction = await this.solanaService.createVersionedTransaction([transactionContext.wallet.payer], swapInstructions, latestBlockhash);
    const serializedSwapTransaction = bs58.encode(swapVersionedTransaction.serialize());
    const swapSignature = bs58.encode(swapVersionedTransaction.signatures[0]);

    const rewardAndReferVersionedTransaction = await this.solanaService.createVersionedTransaction([transactionContext.wallet.payer], rewardAndReferInstructions, latestBlockhash);
    const serializedrewardAndReferTransaction = bs58.encode(rewardAndReferVersionedTransaction.serialize());
    const rewardAndReferSignature = bs58.encode(rewardAndReferVersionedTransaction.signatures[0]);

    this.logger.log('Sending bundle to Jito...');
    this.logger.log(`Swap transaction: https://solsacn.io/tx/${swapSignature}`);
    this.logger.log(`Swap transaction: https://solsacn.io/tx/${rewardAndReferSignature}`);
    
    return await this.jitoService.sendBundleRequest([serializedSwapTransaction, serializedrewardAndReferTransaction], swapSignature, latestBlockhash);
  }

  async handleUserInput(ctx, actionType: string, promptMessage: string) {
    this.utilsService.saveState(ctx, { actionType });
    const message = this.i18n.translate('i18n.input_messages.prompt', { args: { promptMessage } });
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);

    this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
    ctx.wizard.selectStep(2);
  }


  //////////////////////////
  // Other functions
  //@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }

  //@ts-ignore
  @Action('min_buy')
  async minBuy(ctx) {
    this.logger.debug(`clicked on the min_buy`);
    const tokenAddress = ctx.scene.state.token;
    if (!tokenAddress) {
      const errorMessage = this.i18n.translate('i18n.error_messages.token_not_found');
      await this.textService.sendErrorMessage(ctx, errorMessage);
      return;
    }
    await this.processTransaction(ctx, 'min_buy', TransactionType.Buy);
  }

  //@ts-ignore
  @Action('buy_1_sol')
  async buy1Sol(ctx) {
    this.logger.debug(`clicked on the buy_1_sol`);
    await this.processTransaction(ctx, 'buy_1_sol', TransactionType.Buy);
  }

  //@ts-ignore
  @Action('buy_2_sol')
  async buy2Sol(ctx) {
    await this.processTransaction(ctx, 'buy_2_sol', TransactionType.Buy);
  }

  //@ts-ignore
  @Action('buy_0.2_sol')
  async buy0_2Sol(ctx) {
    await this.processTransaction(ctx, 'buy_0.2_sol', TransactionType.Buy);
  }

  //@ts-ignore
  @Action('buy_x_sol')
  async askForValueForBuyXSol(ctx) {
    const message = this.i18n.translate('i18n.input_messages.x_sol_buy');
    await this.handleUserInput(ctx, 'buy_x_sol', message);
  }

  //@ts-ignore
  @Action('sell_10')
  async sell10(ctx) {
    await this.processTransaction(ctx, 'sell_10', TransactionType.Sell);
  }

  //@ts-ignore
  @Action('sell_25')
  async sell25(ctx) {
    await this.processTransaction(ctx, 'sell_25', TransactionType.Sell);
  }

  //@ts-ignore
  @Action('sell_50')
  async sell50(ctx) {
    await this.processTransaction(ctx, 'sell_50', TransactionType.Sell);
  }

  //@ts-ignore
  @Action('sell_100')
  async sell100(ctx) {
    await this.processTransaction(ctx, 'sell_100', TransactionType.Sell);
  }

  //@ts-ignore
  @Action('sell_initial')
  async sellInitial(ctx) {
    await this.processTransaction(ctx, 'sell_initial', TransactionType.Sell);
  }

  //@ts-ignore
  @Action('generate_pnl')
  async generatePnlImage(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const tokenAddress = ctx.scene.state.token;
    const transactions = await this.transactionService.getTransactionsByUserAndToken(user.id, tokenAddress);

    if (!transactions || transactions.length === 0) {
      await this.textService.sendMessageNoButtons(ctx, 'No transactions found.');
      return;
    }

    let investedAmountUSD = 0;
    let investedAmountSOL = 0;
    let currentAmountUSD: number;
    let currentAmountSOL: number;
    let totalTokens = 0;

    transactions.forEach(tx => {
      const amountSol = parseFloat(tx.amountSol);
      const solPriceInUsdc = parseFloat(tx.solPriceInUsdc);
      const amountTokens = parseFloat(tx.amountTokens);

      investedAmountUSD += amountSol * solPriceInUsdc;
      investedAmountSOL += amountSol;
      totalTokens += amountTokens;
    });

    const currentTransaction = transactions[transactions.length - 1];
    currentAmountUSD = parseFloat(currentTransaction.amountSol) * parseFloat(currentTransaction.solPriceInUsdc);
    currentAmountSOL = parseFloat(currentTransaction.amountSol);
    let tradeDetails = ctx.scene.state.tradeDetails;

    if (!tradeDetails) {
      tradeDetails = await this.tokenService.getTokenDetailsForTrade(tokenAddress, user, await this.settingsService.getSettingsByTelegramId(telegramId));
      ctx.scene.state.tradeDetails = tradeDetails;
    }

    const profitUSD = currentAmountUSD - investedAmountUSD;
    const profitSOL = currentAmountSOL - investedAmountSOL;
    const multiplier = currentAmountUSD / investedAmountUSD;

    const data = {
      name: tradeDetails.token_name,
      investedAmountUSD,
      investedAmountSOL,
      multiplier,
      profitUSD,
      profitSOL,
    };
    const message = this.i18n.translate('i18n.trading_pnl_poster');
    const buffer = await this.imageService.createTradeImage(data);
    await this.textService.sendMessageWithPhoto(ctx, ctx.chat.id, { source: buffer }, [], message);
  }

  // common functions
  private async handleInitialPurchase(
    userId: number,
    tradeDetails: TradeDetails,
    transactionHash: string,
    pricePerToken: string,
    solPriceInUsdc: string,
    amountTokens,
    amountSol,
  ) {
    const existingInitialTransaction = await this.transactionService.getInitialTransaction(userId, tradeDetails.token_address);
    if (!existingInitialTransaction) {
      await this.transactionService.createInitialTokenPurchase(
        userId,
        tradeDetails.token_address,
        transactionHash,
        amountTokens,
        amountSol,
        pricePerToken,
        solPriceInUsdc,
      );
    }
  }

  private async recordReferralReward(
    userId: number,
    referralReward: number,
    transactionHash: string,
    pricePerToken: string,
    solPriceInUsdc: string,
  ) {
    const inviter = await this.referralService.getInviter(userId);
    if (inviter) {
      const amountSol = this.utilsService.lamportsToSol(referralReward).toString();
      await this.transactionService.createTransactionIfNotExistsInDB(
        inviter.id,
        'referral_reward',
        transactionHash,
        referralReward.toString(),
        amountSol,
        pricePerToken,
        solPriceInUsdc,
        false,
      );
    }
  }

  private async getInviterId(userId: number): Promise<number | null> {
    const inviter = await this.referralService.getInviter(userId);
    return inviter ? inviter.id : null;
  }

  private async prepareTransactionContext(ctx, actionType: string, transactionType: string): Promise<TransactionContext> {
    const telegramId: bigint = this.utilsService.getTelegramId(ctx);
    const token = ctx.scene.state.token;
    const user = await this.userService.getUserByTelegramId(telegramId) as User;
    if(!user) {
      throw new Error('User not found');
    }
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    let amountSolToSwap: string;

    if (actionType === 'min_buy') {
      amountSolToSwap = settings.minBuy.toString();
    } else if (actionType === 'buy_x_sol') {
      amountSolToSwap = ctx.scene.state.amountSol;
    } else {
      amountSolToSwap = actionType.split('_')[1];
    }

    const fromSecretKey = await this.userService.getUserSecretKey(user.id);
    const tradeDetails = await this.tokenService.getTokenDetailsForTrade(token, user, settings);
    const wallet = this.jupiterService.createWallet(fromSecretKey);
    const amountLamportsToSwap = await this.getAmountLamportsToSwap(
      actionType,
      transactionType,
      fromSecretKey,
      token,
      user.walletAddress,
      tradeDetails,
      amountSolToSwap,
      tradeDetails.rawTokenBalance,
    );

    const inputTokenAddress = this.getInputTokenAddress(transactionType, tradeDetails);
    const outputTokenAddress = this.getOutputTokenAddress(transactionType, tradeDetails);
    const priorityFeeOption = this.utilsService.mapNumberToPriorityFeeOption(settings.priorityFee);
    const priorityFeeLamports = this.utilsService.solToLamports(this.utilsService.getPriorityFeeDetails(priorityFeeOption));
    const developerFeeLamports = this.utilsService.calculateDeveloperFee(amountLamportsToSwap);
    const inviterId = await this.getInviterId(user.id);
    const referralFeeLamports = await this.utilsService.getAmountLamportsForReferral(inviterId, developerFeeLamports);
    const adjustedAmountLamports = amountLamportsToSwap - developerFeeLamports - referralFeeLamports;

    const referralAccount = await this.referralService.getInviter(user.id);
    const referralWalletAddress = referralAccount?.walletAddress;
    this.logger.debug(`referralWalletAddress: ${referralWalletAddress}`);
    return {
      user,
      wallet,
      tradeDetails,
      // settings,
      inputTokenAddress,
      outputTokenAddress,
      adjustedAmountLamports,
      priorityFeeLamports,
      developerFeeLamports,
      referralFeeLamports,
      referralWalletAddress,
      transactionType,
      fromSecretKey,
    };
  }

  private async finalizeTransaction(txSignature: string, transactionContext: TransactionContext, ctx) {
    const solPriceInUsdc = await this.jupiterService.getSolPriceInUsdc();
    const tokenDetails = await this.dexscreenerService.fetchMarketDataByTokenAddress(transactionContext.outputTokenAddress);
    const primaryPair = tokenDetails?.pairs?.[0];
    const tokenPriceInUsdc = primaryPair.priceUsd;
    const quoteResponse = await this.jupiterAPI.fetchQuote(
      transactionContext.inputTokenAddress,
      transactionContext.outputTokenAddress,
      transactionContext.adjustedAmountLamports,
      transactionContext.user.Settings.slippage,
      100,
    );

    let amountTokens: string;
    if (transactionContext.transactionType === TransactionType.Buy) {
      amountTokens = (quoteResponse.outAmount / Math.pow(10, transactionContext.tradeDetails.decimals)).toString();
    } else if (transactionContext.transactionType === TransactionType.Sell) {
      amountTokens = (transactionContext.adjustedAmountLamports / Math.pow(10, transactionContext.tradeDetails.decimals)).toString(); // Adjust this calculation as needed
    } else {
      throw new Error('Invalid transaction type');
    }

    const amountSol = (transactionContext.adjustedAmountLamports / LAMPORTS_PER_SOL).toString();

    await this.transactionService.createTransactionIfNotExistsInDB(
      transactionContext.user.id,
      transactionContext.outputTokenAddress,
      txSignature,
      amountTokens,
      amountSol,
      tokenPriceInUsdc.toString(),
      solPriceInUsdc.toString(),
      transactionContext.transactionType === TransactionType.Buy,
    );

    await this.recordReferralReward(transactionContext.user.id, transactionContext.referralFeeLamports, txSignature, tokenPriceInUsdc.toString(), solPriceInUsdc.toString());

    await this.handleSuccessfulSwap(
      ctx,
      transactionContext.tradeDetails,
      txSignature,
      transactionContext.transactionType,
      amountTokens,
      amountSol,
      solPriceInUsdc.toString(),
    );
  }

  private async getAmountLamportsToSwap(
    actionType: string,
    transactionType: string,
    fromSecretKey: string,
    token: string,
    walletAddress: string,
    tradeDetails,
    amountSolToSwap: string,
    tokenBalance,
  ) {
    if (transactionType === TransactionType.Buy) {
      return this.utilsService.solToLamports(parseFloat(amountSolToSwap));
    }
    return await this.calculateSellAmount(actionType, fromSecretKey, token, walletAddress, tradeDetails, tokenBalance);
  }

  private getInputTokenAddress(transactionType: string, tradeDetails) {
    return transactionType === TransactionType.Buy ? constants.solana.tokens.sol_token_address : tradeDetails.token_address;
  }

  private getOutputTokenAddress(transactionType: string, tradeDetails) {
    return transactionType === TransactionType.Buy ? tradeDetails.token_address : constants.solana.tokens.sol_token_address;
  }

  //SELL
  async calculateSellAmount(
    actionType: string,
    fromSecretKey: string,
    token: string,
    walletAddress: string,
    tradeDetails: TradeDetails,
    tokenBalance,
  ): Promise<number> {
    const sellAction = actionType as SellActions;
    switch (sellAction) {
      case SellActions.Sell10:
        return Math.floor(tokenBalance * 0.1);
      case SellActions.Sell25:
        return Math.floor(tokenBalance * 0.25);
      case SellActions.Sell50:
        return Math.floor(tokenBalance * 0.5);
      case SellActions.Sell100:
        return Math.floor(tokenBalance);
      case SellActions.SellInitial:
        return Math.floor(parseFloat(tradeDetails.initial_token_amount));
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  private async handleSuccessfulSwap(
    ctx,
    tradeDetails: TradeDetails,
    transactionHash: string,
    transactionType: string,
    amountTokens: string,
    amountSol: string,
    solPriceInUsdc: string,
  ) {
    const swapAmountTokens = parseFloat(amountTokens);
    const swapAmountSOL = parseFloat(amountSol);
    const solAmountUSD = (swapAmountSOL * parseFloat(solPriceInUsdc)).toFixed(2);

    await this.solanaService.confirmSwapTransaction(transactionHash);

    const transactionDetails = {
      transactionHash,
      from: tradeDetails.wallet_address,
      to: tradeDetails.token_address,
      amountTokens: transactionType === TransactionType.Sell
        ? swapAmountSOL.toFixed(6)
        : swapAmountTokens.toString(),
      amountSOL: transactionType === TransactionType.Sell
        ? swapAmountTokens.toString()
        : swapAmountSOL.toFixed(6),
      transactionType,
      solscanUrl: `https://solscan.io/tx/${transactionHash}`,
    };

    await this.sendTransactionSuccessMessage(
      ctx,
      transactionDetails,
      transactionType,
      swapAmountTokens,
      swapAmountSOL,
      solAmountUSD,
    );
  }

  private async sendTransactionSuccessMessage(
    ctx,
    transactionDetails: any,
    transactionType: string,
    swapAmountTokens: number,
    swapAmountSOL: number,
    solAmountUSD: string,
  ) {
    let solAmount: string;
    let tokenAmount: string;
    let messageTemplate: string;

    if (transactionType === TransactionType.Buy) {
      solAmount = `${swapAmountSOL.toFixed(4)} ($${solAmountUSD})`;
      tokenAmount = `${this.utilsService.formatLargeNumber(swapAmountTokens)}`;
      messageTemplate = 'swap_sol_token_success';
    } else if (TransactionType.Sell) {
      solAmount = `${swapAmountSOL.toFixed(4)} ($${solAmountUSD})`;
      tokenAmount = `${swapAmountTokens}`;
      messageTemplate = 'swap_token_sol_success';
    }

    this.logger.debug(`transactionDetails full: ${JSON.stringify(transactionDetails, null, 2)}`);
    const existingTransaction = await this.transactionService.getTransactionByHash(transactionDetails.transactionHash);

    const solScanUrl = `https://solscan.io/tx/${transactionDetails.transactionHash}`;
    this.logger.debug('Transaction Details:', {
      transactionHash: existingTransaction.transactionHash,
      solAmount,
      tokenAmount,
      transactionType: transactionType.charAt(0).toUpperCase() + transactionType.slice(1),
      solscanUrl: solScanUrl,
    });

    const message: string = this.i18n.translate(`i18n.success_messages.${messageTemplate}`, {
      args: {
        amountSOL: solAmount,
        amountTokens: tokenAmount,
        transactionType: transactionType.charAt(0).toUpperCase() + transactionType.slice(1),
        solscanUrl: solScanUrl,
      },
    });

    await this.textService.sendMessageNoButtons(ctx, message);
  }
}
