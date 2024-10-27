import {
  ConfirmedSignatureInfo,
  Connection,
  PublicKey,
  SignaturesForAddressOptions,
  VersionedTransaction,
} from '@solana/web3.js';
import { Network, ShyftSdk, TransactionHistory } from '@shyft-to/js';
import { SwapDetailsDTO } from '@shared/types/swap-details';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { SolanaService } from '../../../providers/solana/solana.service';
import { TextService } from '../text/text.service';
import { I18nService } from 'nestjs-i18n';
import { JupiterService } from '../../../providers/jupiter/jupiter.service';
import { User } from '@prisma/client';
import { UserRepository } from '../../../db/repository/user.repository';
import { Wallet } from '@coral-xyz/anchor';
import { UtilsService } from '../utils/utils.service';
import constants from '@shared/constants';

@Injectable()
export class SwapService {
  private readonly connection: Connection;
  private shyftSdk: ShyftSdk;
  private readonly logger = new Logger(this.constructor.name);


  constructor(
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    private readonly textService: TextService,
    private readonly i18n: I18nService,
    private readonly jupiterService: JupiterService,
    private readonly utilsService: UtilsService,
    private readonly userService: UserRepository,
  ) {
    const heliusRpcUrl = this.configService.get<string>('blockchain.solana.rpcUrl');
    const shyftApiKey = this.configService.get<string>('blockchain.shyft.apiKey');
    this.connection = new Connection(heliusRpcUrl, { commitment: 'confirmed' });
    this.shyftSdk = new ShyftSdk({ apiKey: shyftApiKey, network: Network.Mainnet });
  }

  async paginateSignaturesTillTime(
    address: PublicKey,
    until: number,
    sigLimit: number = 10000,
  ): Promise<ConfirmedSignatureInfo[]> {
    let sigLimitForRequest = sigLimit < 1000 ? sigLimit : 1000;
    const initialSignatures = await this.getSignaturesForAddress(address, sigLimitForRequest);

    let signaturesToReturn: ConfirmedSignatureInfo[] = [];

    if (initialSignatures && initialSignatures.length > 0) {
      let oldestTime = initialSignatures[initialSignatures.length - 1]?.blockTime;
      signaturesToReturn = initialSignatures.filter((sig) => sig.blockTime <= until);
      await this.displaySignatures(signaturesToReturn);

      let count = 0;

      while (oldestTime && oldestTime > until) {
        const newSignatures = await this.getSignaturesForAddress(address, sigLimitForRequest);
        if (!newSignatures.length || signaturesToReturn.length >= sigLimit) break;

        console.log('Requesting for more pages.... count: ', ++count, ' length: ', signaturesToReturn.length, 'latest timestamp: ', this.formatUnixBlockTime(newSignatures[newSignatures.length - 1]?.blockTime || 0));

        signaturesToReturn = signaturesToReturn.concat(newSignatures).filter(sig => sig.blockTime <= until);
        oldestTime = newSignatures[newSignatures.length - 1]?.blockTime;
      }
    } else {
      console.log('No signatures found.');
    }

    return signaturesToReturn;
  }

  private async displaySignatures(signatures: ConfirmedSignatureInfo[], limit = 3) {
    if (signatures.length === 0) {
      return;
    }

    const filteredSignatures = signatures.filter((tx) => tx !== undefined);
    const txHistory = filteredSignatures.map((tx) => ({
      time: moment.unix(tx.blockTime).format('YYYY-MM-DD HH:mm:ss'),
      signature: tx.signature,
      confirmationStatus: tx.confirmationStatus,
    }));
    const oldest = txHistory.length > 0 ? txHistory[txHistory.length - 1].time : undefined;
    const newest = txHistory.length > 0 ? txHistory[0].time : undefined;
  }

  private async getSignaturesForAddress(walletAddress: PublicKey, limit = 1000, before?: string, until?: number | string): Promise<ConfirmedSignatureInfo[]> {
    const options: SignaturesForAddressOptions = before && until
      ? { before, until: until.toString() } : { limit };

    return await this.connection.getSignaturesForAddress(walletAddress, options);
  }

  private async parseSwapDetailsFromActions(actions: any[], swapDetails: SwapDetailsDTO): Promise<SwapDetailsDTO> {
    actions.forEach((action) => {
      if (action.type === 'SWAP' && action.info.tokens_swapped) {
        const { swaps } = action.info;
        swapDetails.sellToken = {
          tokenAddress: swaps[0].in.token_address,
          amount: swaps[0].in.amount_raw,
          symbol: swaps[0].in.symbol,
        };
        swapDetails.buyToken = {
          tokenAddress: swaps[0].out.token_address,
          amount: swaps[0].out.amount_raw,
          symbol: swaps[0].out.symbol,
        };
      }
    });

    return swapDetails;
  }

  private outputActionDetails(actions: string[]) {
    actions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private formatUnixBlockTime(time: number): string {
    return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
  }

  async getSwapDetailsStartAndEndSignatures(sigStart: string, sigEnd: string, account: string): Promise<SwapDetailsDTO[]> {
    let swapDetailsArr: SwapDetailsDTO[] = [];

    const transactions: TransactionHistory = await this.shyftSdk.transaction.history({
      account: account,
      beforeTxSignature: sigStart,
      untilTxSignature: sigEnd,
      enableRaw: false,
      enableEvents: false,
    });
    let actions: string[] = [];

    await Promise.all(
      transactions.map(async (transaction) => {
        let swapDetails: SwapDetailsDTO = {
          signatures: transaction.signatures,
          signers: transaction.signers,
          timestamp: Number(transaction.timestamp),
        };
        swapDetails = await this.parseSwapDetailsFromActions(transaction.actions, swapDetails);
        actions.concat(transaction.actions.map((action) => action.type));
        swapDetails.buyToken && swapDetails.sellToken && swapDetailsArr.push(swapDetails);
      }),
    );

    this.outputActionDetails(actions);
    return swapDetailsArr;
  }

  async paginateSwapDetailsFromSignatures(signatures: string[]): Promise<SwapDetailsDTO[]> {
    let swapDetailsArr: SwapDetailsDTO[] = [];
    let actions: string[] = [];
    for (let i = 0; i < signatures.length; i += 100) {
      const sigs = signatures.slice(i, i + 100);
      const swapDetails = await this.getSwapDetailsFromSignatures(sigs, actions);
      swapDetailsArr = swapDetailsArr.concat(swapDetails);
    }

    this.outputActionDetails(actions);

    return swapDetailsArr;
  }

  private convertIsoToUnix(dateString: string): number {
    const date = new Date(dateString);
    return date.getTime() / 1000;
  }

  private async getSwapDetailsFromSignatures(signatures: string[], actions: string[] = []): Promise<SwapDetailsDTO[]> {
    let swapDetailsArr: SwapDetailsDTO[] = [];

    const transactions = await this.shyftSdk.transaction.parseSelected({ transactionSignatues: signatures });

    await Promise.all(
      transactions.map(async (transaction) => {
        let swapDetails: SwapDetailsDTO = {
          signatures: transaction.signatures,
          signers: transaction.signers,
          timestamp: this.convertIsoToUnix(transaction.timestamp),
          timestampISO: transaction.timestamp,
        };
        swapDetails = await this.parseSwapDetailsFromActions(transaction.actions, swapDetails);
        swapDetails.buyToken && swapDetails.sellToken && swapDetailsArr.push(swapDetails);
        actions.push(...transaction.actions.map((action) => action.type));
      }),
    );

    return swapDetailsArr;
  }

  async getSwapDetailsWithLimit(publicKey: PublicKey, limit = 10): Promise<SwapDetailsDTO[]> {
    const signatures = (await this.getSignaturesForAddress(publicKey, limit)).map((sig) => sig.signature);

    return await this.getSwapDetailsFromSignatures(signatures);
  }

  async getSwapDetailsUntilTime(address: PublicKey, until: number, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const signatures = (await this.paginateSignaturesTillTime(address, until, sigLimit)).map((sig) => sig.signature);

    return await this.paginateSwapDetailsFromSignatures(signatures);
  }

  async getSwapDetailsFromOneMinute(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 60).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsFromFiveMinutes(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 300).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsFromOneHour(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 3600).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsFromSixHours(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 21600).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsFromTwelveHours(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 43200).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsFromOneDay(address: PublicKey, sigLimit: number = 10000): Promise<SwapDetailsDTO[]> {
    const until = parseInt((Date.now() / 1000 - 86400).toPrecision(10));
    return this.getSwapDetailsUntilTime(address, until, sigLimit);
  }

  async getSwapDetailsBetweenSignatures(account: string): Promise<SwapDetailsDTO[]> {
    const signatures = await this.getSignaturesForAddress(new PublicKey(account), 3);
    console.log('Signatures: ', signatures.length);

    const startSig = signatures[signatures.length - 1].signature;
    const endSig = signatures[0].signature;

    const swapDetails = await this.getSwapDetailsStartAndEndSignatures(startSig, endSig, account);
    console.log('swapDetails: ', swapDetails.length);

    return swapDetails;
  }


  async processUSDCToSOL(ctx, amount: number, user: User) {
    try {
      const fromSecretKey = await this.userService.getUserSecretKey(user.id);
      const wallet = this.jupiterService.createWallet(fromSecretKey);
      const txid = await this.swapUSDCToSOL(wallet, amount, 50);
      if (txid) {
        const solscanUrl = `https://solscan.io/tx/${txid}`;
        const successMessage = this.i18n.translate('i18n.success_messages.swap_token_success', {
          args: { txid, amount, solscanUrl },
        });
        await this.textService.sendMessageNoButtons(ctx, successMessage);
      } else {
        throw new Error('Transaction ID missing; swap may not have been successful.');
      }
    } catch (error) {
      this.logger.error('Error processing USDC to SOL swap', error.stack);
      const errorMessage = this.i18n.translate('i18n.error_messages.swap_failed');
      await this.textService.sendMessageNoButtons(ctx, errorMessage);
    }
  }

  async processSOLToUSDC(ctx, amount: number, user: User) {
    try {
      const fromSecretKey = await this.userService.getUserSecretKey(user.id);
      const wallet = this.jupiterService.createWallet(fromSecretKey);
      this.logger.debug('Wallet created successfully for the swap.');
      const txid = await this.swapSOLToUSDC(wallet, amount, 50);
      const transactionType = 'swap SOL to USDC';
      const solscanUrl = `https://solscan.io/tx/${txid}`;
      const successMessage = this.i18n.translate('i18n.success_messages.swap_token_success', {
        args: { transactionType, txid, solscanUrl },
      });

      await this.textService.sendMessageNoButtons(ctx, successMessage);
    } catch (error) {
      this.logger.error('Error during SOL to USDC swap:', error);
      const errorMessage = this.i18n.translate('i18n.error_messages.swap_failed');
      await this.textService.sendErrorMessage(ctx, errorMessage);
    }
  }

  async swapUSDCToSOL(wallet: Wallet, amountLamports: number, slippageBps: number): Promise<string> {
    const solMintAddress = constants.solana.tokens.sol_token_address;
    const usdcMintAddress = constants.solana.tokens.usdc_token_address;
    try {
      const quoteResponse = await this.jupiterService.getQuote(usdcMintAddress, solMintAddress, amountLamports, slippageBps);
      const swapTransaction = await this.jupiterService.getSwapJupiterTransaction(wallet, quoteResponse);
      this.logger.debug(`Swap transaction:, ${JSON.stringify(swapTransaction)}`);
      const txid = await this.sendTransaction(wallet, swapTransaction);
      this.logger.debug(`Swap successful, transaction ID: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Error during USDC to SOL swap: ${error.message}`);
      throw error;
    }
  }

  async swapSOLToUSDC(wallet: Wallet, amountLamports: number, slippageBps: number): Promise<string> {
    const solMintAddress = constants.solana.tokens.sol_token_address;
    const usdcMintAddress = constants.solana.tokens.usdc_token_address;

    this.logger.debug('Swapping SOL to USDC...');
    this.logger.debug(`Amount (lamports): ${amountLamports}, Slippage (bps): ${slippageBps}`);

    try {
      const quoteResponse = await this.jupiterService.getQuote(solMintAddress, usdcMintAddress, amountLamports, slippageBps);
      this.logger.debug('Quote response:', quoteResponse);

      const swapTransaction = await this.jupiterService.getSwapJupiterTransaction(wallet, quoteResponse);
      this.logger.debug('Swap transaction:', swapTransaction);

      const txid = await this.sendTransaction(wallet, swapTransaction);
      this.logger.debug(`Swap successful, transaction ID: ${txid}`);

      return txid;
    } catch (error) {
      this.logger.error(`Error during SOL to USDC swap: ${error.message}`);
      throw error;
    }
  }

  async sendTransaction(wallet: Wallet, transaction: VersionedTransaction): Promise<string> {
    const latestBlockHash = await this.connection.getLatestBlockhash();
    const rawTransaction = transaction.serialize();

    const txid = await this.connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 4,
    });

    await this.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid,
    });

    return txid;
  }
}
