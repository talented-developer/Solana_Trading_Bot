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
import { ReferralRepository } from '../../db/repository/referral.repository';
import { ImageService } from '../service/utils/image.service';
import { ShyftApiService } from '../../providers/shyft/shyft-api.service';
import { JupiterAPI } from '../../providers/jupiter/jupiterAPI';
import { JitoService } from '../../providers/jito/jito.service';
import { DexscreenerService } from '../../providers/dexscreener/dexscreener.service';
import { TokenDetailsService } from '../service/token-details/token-details.service';
import { AlertService } from '../service/alert/alert.service';
import { NotificationDto } from '@shared/types/notification-alert';
import { WhaleDetectionService } from '../service/whale-detection/whale-detection.service';
import { ScoreManager } from '../managers/score-manager';

@Wizard('broadcast')
export class BroadcastScene {
  private readonly logger = new Logger(this.constructor.name);

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
    private readonly alertService: AlertService,
    private readonly whaleDetectionService: WhaleDetectionService,
    private readonly scoreManager: ScoreManager,
  ) {
  }

  @WizardStep(0)
  async requestTokenAddress(ctx) {
    const userRole = await this.userService.getUserRole(ctx.from.id);
    if (userRole !== 'ADMIN') {
      ctx.scene.state = {};
      return;
    }
    if (await this.handleCommand(ctx)) {
      return;
    }

    if (ctx.scene.state.token) {
      await this.handleTokenAddress(ctx);
    } else {
      const message = this.i18n.translate('i18n.input_messages.broadcast_solana_token');
      const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
      this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
      ctx.wizard.selectStep(1);
    }
  }

  @WizardStep(1)
  async handleTokenAddress(ctx) {
    if (await this.handleCommand(ctx)) {
      return;
    }
    const tokenAddress = ctx.message?.text?.trim();
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

  @WizardStep(2)
  async handleUserReply(ctx) {
    this.logger.debug('~~~ Trade scene: step 2~~~');
    if (await this.handleCommand(ctx)) {
      return;
    }
    const errorMsg = this.i18n.translate('i18n.input_messages.token_not_found');
    await this.textService.sendErrorMessage(ctx, errorMsg);
    this.logger.debug('Token not found in state');
    return;
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

  private async processTokenAddress(ctx, tokenAddress: string) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const tokenPnlAndWinrate = await this.tokenService.getTokenPnlAndWinRate(tokenAddress);
    const whaleCount = await this.whaleDetectionService.getWhalesAddresses(tokenAddress);
    const tokenDetails = await this.tokenService.getTokenDetails(tokenAddress);
    const { score, scoreBreakdown } = await this.scoreManager.calculateTokenScore(
      tokenDetails,
      tokenPnlAndWinrate,
      whaleCount,
      true,
    );

    ctx.scene.state.tradeDetails = {
      token_address: tokenAddress,
      tokenPnlAndWinrate,
      whaleCount,
      tokenDetails,
      score,
    };

    await this.sendTradeDetails(ctx, ctx.scene.state.tradeDetails, user);
  }

  private async sendTradeDetails(ctx, tradeDetails, user) {
    this.logger.debug('Sending trade details');
    const transactionRecord = await this.transactionService.getInitialTransaction(user.id, tradeDetails.token_address);
    tradeDetails.initial_token_amount = transactionRecord ? transactionRecord.amountTokens : '0';
    const notificationTypeText = await this.i18n.translate('i18n.call_type.new_call');

    const alertText = await this.alertService.getAlertText(
      tradeDetails.tokenDetails,
      notificationTypeText,
      tradeDetails.whaleCount,
      tradeDetails.score,
      tradeDetails.tokenPnlAndWinrate,
      null,
      null,
    );

    const tokenTemplate = this.i18n.translate('i18n.calls_token_info', { args: alertText });
    const buttons = await this.markupButtonsService.broadcastMenuButtons();
    await this.textService.sendMessageWithButtonsWithPreview(ctx, tokenTemplate, buttons);

    this.logger.debug('Trade details sent with buttons');
  }

  //@ts-ignore
  @Action('send_button')
  async sendTokenToSubscribers(ctx) {
    const tradeDetails = ctx.scene.state.tradeDetails;

    const notification: NotificationDto = { tokenAddress: tradeDetails.token_address };
    const notificationTypeText = await this.i18n.translate('i18n.call_type.new_call');
    const filtersToApply = [];

    await this.alertService.processTokenAlert(
      notification,
      notificationTypeText,
      filtersToApply,
      tradeDetails.whaleCount,
      tradeDetails.score,
      tradeDetails.tokenDetails,
      null,
      null,
      tradeDetails.tokenPnlAndWinrate,
    );

    this.logger.debug(`Token ${tradeDetails.token_address} sent to subscribers`);
  }

  //@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }
}
