import { Injectable, Logger } from '@nestjs/common';
import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Settings, User } from '@prisma/client';
import { UserRepository } from '../../db/repository/user.repository';
import { SettingsRepository } from '../../db/repository/settings.repository';
import { I18nService } from 'nestjs-i18n';
import { UtilsService } from '../service/utils/utils.service';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { SolanaService } from '../../providers/solana/solana.service';
import * as qrcode from 'qrcode';
import { TextService } from '../service/text/text.service';
import { Message } from '@telegraf/types';
import constants from '../../../shared/constants';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SwapService } from '../service/swap/swap.service';

@Injectable()
@Wizard('wallet')
export class WalletWizard {
  private readonly logger = new Logger(WalletWizard.name);

  constructor(
    private readonly userService: UserRepository,
    private readonly settingsService: SettingsRepository,
    private readonly i18n: I18nService,
    private readonly utilsService: UtilsService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly solanaService: SolanaService,
    private readonly textService: TextService,
    private readonly swapService: SwapService,
  ) {
  }

  private async generateWalletMessage(user: User, settings: Settings) {
    const walletTemplate = this.i18n.translate('i18n.wallet_info');
    const balanceSolLamports = await this.solanaService.getSolBalance(user.walletAddress);
    const balanceSol = this.utilsService.lamportsToSol(balanceSolLamports);
    let balanceUSDC = 0;
    if (balanceSol > 0) {
      try {
        const fromSecretKey = await this.userService.getUserSecretKey(user.id);
        const fromKeypair = this.solanaService.keypairFromSecretKeyString(fromSecretKey);
        const usdcAccount = await this.solanaService.getOrCreateUSDCAccount(fromKeypair, user.walletAddress);
        if (usdcAccount) {
          balanceUSDC = await this.solanaService.getUSDCBalance(user.walletAddress);
        }
      } catch (error) {
        this.logger.error(`Failed to fetch USDC balance for user: ${user.walletAddress}`, error.stack);
      }
    }

    const walletDetails = {
      wallet_address: user.walletAddress,
      balance: balanceSol.toFixed(3),
      withdrawWallet: settings.withdrawWallet || 'N/A',
      usdc_balance: balanceUSDC.toFixed(3),
    };

    return this.utilsService.formatText(walletTemplate, walletDetails);
  }

  @WizardStep(0)
  async handleWalletCommand(ctx) {
    if (await this.handleCommand(ctx)) return;

    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const message = await this.generateWalletMessage(user, settings);
    const buttons = await this.markupButtonsService.walletMenuButtons();

    await this.textService.sendMessageWithButtons(ctx, message, buttons);
    ctx.wizard.selectStep(1);
  }


  @WizardStep(1)
  async handleWithdrawWalletInput(ctx) {
    if (await this.handleCommand(ctx)) return;

    const telegramId = this.utilsService.getTelegramId(ctx);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const walletAddressFromInput = this.utilsService.getTextFromInput(ctx);
    const validationResult = await this.validateAndUpdateSetting(ctx, walletAddressFromInput, settings);

    if (validationResult.errorMessage) {
      return;
    }

    const amountToSendMessage = this.i18n.translate('i18n.input_messages.withdraw_amount');
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, amountToSendMessage);
    this.saveState(ctx, 'amountToSend', replyMessage);
    ctx.wizard.selectStep(2);
  }

  @WizardStep(2)
  async handleWithdrawConfirmation(ctx) {
    if (await this.handleCommand(ctx)) return;

    const telegramId = this.utilsService.getTelegramId(ctx);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const withdrawWallet = settings.withdrawWallet;
    const amountToSend = this.utilsService.getTextFromInput(ctx);

    if (ctx.callbackQuery && ctx.callbackQuery.data === 'cancel_withdraw') {
      return await this.cancelWithdraw(ctx);
    }

    const validationResult = this.utilsService.validatePositiveNumber(amountToSend);
    if (validationResult.errorMessage) {
      await this.textService.sendMessageNoButtons(ctx, this.i18n.translate(validationResult.errorMessage));
      return;
    }

    ctx.scene.state.amountToSend = validationResult.value;
    const confirmMessage = this.i18n.translate('i18n.withdraw_wallet_confirmation', {
      args: {
        withdrawWallet,
        amountToSend,
      },
    });

    const buttons = await this.markupButtonsService.withdrawWalletConfirmationButtons();
    await this.textService.sendMessageWithButtons(ctx, confirmMessage, buttons);
    ctx.wizard.selectStep(3);
  }

  private async handleCommand(ctx): Promise<boolean> {
    return this.utilsService.checkAndHandleCommand(
      ctx,
      this.startNewInstance.bind(this),
      this.close.bind(this),
    );
  }

  private async startNewInstance(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const message = await this.generateWalletMessage(user, settings);
    const buttons = await this.markupButtonsService.walletMenuButtons();

    await this.textService.sendMessageWithButtons(ctx, message, buttons);
    ctx.wizard.selectStep(1);
  }

  private async validateAndUpdateSetting(ctx, inputValue: string, settings: Settings): Promise<{
    value: string | number | null;
    errorMessage: string | null
  }> {
    const { settingKey } = ctx.scene.state;
    const result = this.utilsService.validateOnSettingsKey(settingKey, inputValue, settings);
    if (result.errorMessage) {
      await this.textService.sendMessageNoButtons(ctx, this.i18n.translate(result.errorMessage));
      return { value: null, errorMessage: result.errorMessage };
    }

    if (settingKey === 'withdrawWallet') {
      await this.settingsService.updateWithdrawWallet(ctx.from.id, result.value as string);
    } else {
      ctx.scene.state.amountToSend = result.value;
    }

    return { value: result.value, errorMessage: null };
  }

  private saveState(ctx, settingKey: string, replyMessage: Message) {
    ctx.scene.state.settingKey = settingKey;
    ctx.scene.state.messageIdEnterAmount = ctx.callbackQuery?.message?.message_id ?? null;
    ctx.scene.state.replyMessageId = replyMessage.message_id;
  }

  async processTransaction(user: User, withdrawWallet: string, lamportsToSend: number): Promise<string> {
    const fromSecretKey = await this.userService.getUserSecretKey(user.id);
    return this.solanaService.sendSolWithKey(fromSecretKey, withdrawWallet, lamportsToSend);
  }

  async handleWithdrawTransaction(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const solToSend = parseFloat(ctx.scene.state.amountToSend);
    const lamportsToSend = this.utilsService.solToLamports(solToSend);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);

    const transactionSuccess = await this.attemptTransaction(ctx, user, settings.withdrawWallet, lamportsToSend, solToSend.toString());
    if (transactionSuccess) {
      await ctx.scene.leave();
    } else {
      const message = this.i18n.translate('i18n.error_messages.solana_doesnt_response_error');
      await this.textService.sendMessageNoButtons(ctx, message);
    }
  }


  async attemptTransaction(ctx, user, withdrawWallet, lamportsToSend, amountSOL: string) {
    try {
      const transactionHash = await this.processTransaction(user, withdrawWallet, lamportsToSend);
      const transactionDetails = this.solanaService.createTransactionDetails(
        transactionHash,
        user.walletAddress,
        withdrawWallet,
        constants.solana.transaction_type.withdraw_sol,
        parseFloat(amountSOL),
        lamportsToSend / LAMPORTS_PER_SOL,
      );

      await this.sendSuccessMessage(ctx, transactionDetails);
      return true;
    } catch (error) {
      const message = this.i18n.translate('i18n.error_messages.solana_doesnt_response_error');
      await this.textService.sendMessageNoButtons(ctx, message);
      this.logger.error('Transaction failed', error.stack);
      return false;
    }
  }

  async sendSuccessMessage(ctx, transactionDetails: any) {
    this.logger.debug(`Sending success message with details: ${JSON.stringify(transactionDetails)}`);

    const message = this.i18n.translate('i18n.success_messages.swap_token_success', {
      args: {
        transactionType: transactionDetails.transactionType,
        solscanUrl: transactionDetails.solscanUrl,
      },
    });

    await this.textService.sendMessageNoButtons(ctx, message);
    this.logger.debug('Success message sent.');
  }

//@ts-ignore
  @Action('withdraw_sol')
  async handleWithdrawAction(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const withdrawWallet = settings.withdrawWallet;

    if (!withdrawWallet) {
      // Prompt user to enter a withdrawal wallet address first
      const addWalletMessage = this.i18n.translate('i18n.input_messages.add_withdraw_wallet');
      const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, addWalletMessage);
      this.saveState(ctx, 'withdrawWallet', replyMessage); // Save state for withdrawWallet input
      ctx.wizard.selectStep(1); // Go to step 1 to handle wallet input
    } else {
      // Wallet is set, proceed to ask for the withdrawal amount
      const amountToSendMessage = this.i18n.translate('i18n.input_messages.withdraw_amount');
      const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, amountToSendMessage);
      this.saveState(ctx, 'amountToSend', replyMessage); // Save state for amount input
      ctx.wizard.selectStep(2); // Go to step 2 to handle amount input
    }
  }

//@ts-ignore
  @Action('confirm_withdraw')
  async confirmWithdrawTransaction(ctx) {
    await this.handleWithdrawTransaction(ctx);
  }

//@ts-ignore
  @Action('cancel_withdraw')
  async cancelWithdraw(ctx) {
    await ctx.reply(this.i18n.translate('i18n.replies.withdraw_canceled'));
    await ctx.scene.leave();
  }

//@ts-ignore
  @Action('deposit_sol')
  async generateQRCode(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const qrCodeBuffer = await qrcode.toBuffer(user.walletAddress, { type: 'png' });
    const photoInputFile = { source: qrCodeBuffer };
    const chatId = ctx.chat.id;
    const caption = this.i18n.translate('i18n.wallet_address', { args: { wallet_address: user.walletAddress } });
    const buttons = await this.markupButtonsService.depositMenuButton();
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }

    await this.textService.sendMessageWithPhoto(ctx, chatId, photoInputFile, buttons, caption);
  }

//@ts-ignore
  @Action('back_to_wallet')
  async backToWalletMenu(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const message = await this.generateWalletMessage(user, settings);
    const buttons = await this.markupButtonsService.walletMenuButtons();

    // Delete current message
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }

    await this.textService.sendMessageWithButtons(ctx, message, buttons);
  }

//@ts-ignore
  @Action('refresh')
  async refreshWalletMessage(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const updatedMessageText = await this.generateWalletMessage(user, settings);
    const buttons = await this.markupButtonsService.walletMenuButtons();
    const currentMessage: any = ctx.callbackQuery.message;
    const currentText = currentMessage.text.replace(/\s/g, '');
    const newText = updatedMessageText.replace(/\s/g, '');
    if (this.utilsService.hasContentChanged(currentText, currentMessage.reply_markup.inline_keyboard, newText, buttons)) {
      await this.textService.updateMessage(ctx, updatedMessageText, buttons, ctx.chat.id, currentMessage.message_id);
    } else {
      this.logger.debug('No changes detected, skipping update.');
    }
  }

//@ts-ignore
  @Action('cancel')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }

//@ts-ignore
  @Action('swap_usdc_sol')
  async swapUSDCToSOL(ctx) {
    const message = this.i18n.translate('i18n.input_messages.swap_usdc_sol');
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
    this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id, swapType: 'usdc_to_sol' });
    ctx.wizard.selectStep(3);
  }

//@ts-ignore
  @Action('swap_sol_usdc')
  async swapSOLToUSDC(ctx) {
    const message = this.i18n.translate('i18n.input_messages.swap_sol_usdc');
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
    this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id, swapType: 'sol_to_usdc' });
    ctx.wizard.selectStep(3);
  }

  @WizardStep(3)
  async handleUserInputForSwap(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user: User = await this.userService.getUserByTelegramId(telegramId);
    const rawInput = ctx.message.text.trim().replace(',', '.');
    const userInput = parseFloat(rawInput);
    const { swapType } = ctx.scene.state;

    if (isNaN(userInput) || userInput <= 0) {
      const errorMessage = this.i18n.translate('i18n.error_messages.invalid_amount');
      await this.textService.sendErrorMessage(ctx, errorMessage);
      return;
    }

    if (swapType === 'usdc_to_sol' && userInput < 1.0) {
      const errorMessage = this.i18n.translate('i18n.error_messages.insufficient_input_usdc');
      await this.textService.sendErrorMessage(ctx, errorMessage);
      return;
    } else if (swapType === 'sol_to_usdc' && userInput < 0.01) {
      const errorMessage = this.i18n.translate('i18n.error_messages.insufficient_input_sol');
      await this.textService.sendErrorMessage(ctx, errorMessage);
      return;
    }

    if (swapType === 'usdc_to_sol') {
      const amountInLamports = this.utilsService.usdcToLamports(userInput);
      await this.swapService.processUSDCToSOL(ctx, amountInLamports, user);
    } else if (swapType === 'sol_to_usdc') {
      const amountInLamports = this.utilsService.solToLamports(userInput);
      await this.swapService.processSOLToUSDC(ctx, amountInLamports, user);
    }

    ctx.scene.leave();
  }

//@ts-ignore
  @Action('export_pk')
  async exportPK(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);

    const privateKey = await this.userService.getUserSecretKey(user.id);
    const closeButton = await this.markupButtonsService.exportPKClose();

    const message = this.i18n.translate('i18n.export_private_key', {
      args: { privateKey },
    });
    const sentMessage = await this.textService.sendMessageWithButtons(ctx, message, closeButton);
    setTimeout(async () => {
      try {
        await ctx.deleteMessage(sentMessage.message_id);
      } catch (error) {
        if (error.response?.error_code === 400 && error.response?.description === 'Bad Request: message to delete not found') {
          this.logger.debug('Message not found or already deleted, skipping...');
        } else {
          throw error;
        }
      }
    }, 60000);
  }
}
