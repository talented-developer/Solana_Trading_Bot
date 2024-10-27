import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NotificationDto, NotificationType, TokenFilterType } from '@shared/types/notification-alert';
import { HttpService } from '@nestjs/axios';
import { GlobalFilterService } from '../global-filter/global-filter.service';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly telegramApibaseUrl: string;

  constructor(
    private readonly tokenFilterService: GlobalFilterService,
    private readonly httpService: HttpService,
    private readonly alertProcessingService: AlertService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {
    this.telegramApibaseUrl = this.configService.get<string>('telegram.bot.telegramApibaseUrl');
  }

  async handleNotificationFromStream(notification: NotificationDto) {
    this.logger.debug(`Received notification: ${JSON.stringify(notification)}`);
    try {
      const processingPromises = [];
      switch (notification.type) {
        case NotificationType.RAYDIUM_TOKEN_LAUNCH:
          processingPromises.push(this.handleRaydiumTokenCall(notification));
          break;
        case NotificationType.VOLUME_SPIKE:
          processingPromises.push(this.handleVolumeSpikeCall(notification));
          break;
        case NotificationType.LARGE_BUY:
          processingPromises.push(this.handleLargeBuyCall(notification));
          break;
        case NotificationType.LARGE_SELL:
          processingPromises.push(this.handleLargeSellCall(notification));
          break;
        default:
          this.logger.warn(`Unrecognized notification type: ${notification.type}`);
          return;
      }

      const results = await Promise.allSettled(processingPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.logger.debug(`Notification type ${notification.type} processed successfully.`);
        } else {
          this.logger.error(`Error processing notification type ${notification.type}: ${result.reason}`);
        }
      });

    } catch (error) {
      this.logger.error(`Error handling notification: ${error.message}`);
      if (error.response && error.response.status === HttpStatus.TOO_MANY_REQUESTS) {
        this.logger.warn('Rate-limited. Will retry...');
      }
    }
  }

  async handleRaydiumTokenCall(notification: NotificationDto) {
    const filtersToApply = [
      TokenFilterType.MarketNameFilter,
      TokenFilterType.MinLiquidityFilter,
      TokenFilterType.FreezeAuthority,
      TokenFilterType.MintFilter,
      TokenFilterType.LiquidityLock,
      TokenFilterType.DevWalletValue,
      TokenFilterType.NumberOfHolders,
      TokenFilterType.ScoreFilter,
      TokenFilterType.LiquidityRatio,
      // TokenFilterType.IsMutable,
      // TokenFilterType.PriceChangePositive,
    ];
    const notificationTypeText = await this.i18n.translate('i18n.call_type.raydium_token_launch');
    const validationResults = await this.tokenFilterService.validateToken(notification.tokenAddress, filtersToApply, notification.type);
    const {
      isValid,
      tokenDetails,
      whaleCount,
      score,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
    } = validationResults;
    this.logger.debug(`tokenPnlAndWinrate handleRaydiumTokenCall call : ${JSON.stringify(tokenPnlAndWinrate)}`);
    if (!isValid) return;

    await this.alertProcessingService.processTokenAlert(
      notification,
      notificationTypeText,
      filtersToApply,
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
    );
  }

  async handleVolumeSpikeCall(notification: NotificationDto) {
    const filtersToApply = [
      TokenFilterType.MinLiquidityFilter,
      TokenFilterType.FreezeAuthority,
      TokenFilterType.LiquidityLock,
      TokenFilterType.MintFilter,
      TokenFilterType.DevWalletValue,
      TokenFilterType.NumberOfHolders,
      TokenFilterType.ScoreFilter,
      TokenFilterType.LiquidityRatio,
    ];
    const validationResults = await this.tokenFilterService.validateToken(notification.tokenAddress, filtersToApply, notification.type);
    if (!validationResults.isValid) {
      this.logger.debug(`Token is not valid, isValid: ${validationResults.isValid}`);
      return;
    }
    const {
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
      notificationTypeText,
    } = validationResults;

    const translatedText = await this.i18n.translate('i18n.call_type.large_buy');
    this.logger.debug(`translatedText: ${JSON.stringify(notificationTypeText)}`);
    await this.alertProcessingService.processTokenAlert(
      notification,
      translatedText,
      filtersToApply,
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
    );
  }

  async handleLargeBuyCall(notification: NotificationDto) {
    const filtersToApply = [
      TokenFilterType.MinLiquidityFilter,
      TokenFilterType.FreezeAuthority,
      TokenFilterType.LiquidityLock,
      TokenFilterType.MintFilter,
      TokenFilterType.DevWalletValue,
      TokenFilterType.NumberOfHolders,
      TokenFilterType.ScoreFilter,
      TokenFilterType.LiquidityRatio,
      // TokenFilterType.IsMutable,
      // TokenFilterType.PriceChange,
      // TokenFilterType.BuyVolumeCount,
      // TokenFilterType.VolumeBuySpike,
      // TokenFilterType.PriceChangePositive,
    ];

    const validationResults = await this.tokenFilterService.validateToken(notification.tokenAddress, filtersToApply, notification.type);

    if (!validationResults.isValid) {
      this.logger.debug(`Token is not valid, isValid: ${validationResults.isValid}`);
      return;
    }

    const {
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
      notificationTypeText,
    } = validationResults;

    let translationKey;
    switch (notificationTypeText) {
      case NotificationType.NEW_CALL:
        translationKey = 'i18n.call_type.new_call';
        break;
      case NotificationType.LARGE_BUY:
        translationKey = 'i18n.call_type.large_buy';
        break;
      case NotificationType.RAYDIUM_TOKEN_LAUNCH:
        translationKey = 'i18n.call_type.raydium_token_launch';
        break;

    }

    const translatedText = await this.i18n.translate(translationKey) as string; // Type assertion
    this.logger.debug(`translatedText: ${JSON.stringify(notificationTypeText)}`);
    this.logger.debug(`translatedText: ${translationKey}`);
    await this.alertProcessingService.processTokenAlert(
      notification,
      translatedText,
      filtersToApply,
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
    );
  }

  async handleLargeSellCall(notification: NotificationDto) {
    const filtersToApply = [
      TokenFilterType.MinLiquidityFilter,
      TokenFilterType.FreezeAuthority,
      // TokenFilterType.IsMutable,
      TokenFilterType.LiquidityLock,
      TokenFilterType.MintFilter,
      TokenFilterType.DevWalletValue,
      TokenFilterType.NumberOfHolders,
      TokenFilterType.ScoreFilter,
      TokenFilterType.PriceChange,
      TokenFilterType.LiquidityRatio,
      // TokenFilterType.VolumeSellSpike,
      // TokenFilterType.PriceChangePositive,
      // TokenFilterType.BuyVolumeCount,
    ];

    const validationResults = await this.tokenFilterService.validateToken(notification.tokenAddress, filtersToApply, notification.type);
    const notificationTypeText = await this.i18n.translate('i18n.call_type.large_sell');
    if (!validationResults.isValid) {
      this.logger.debug(`Token is not valid, isValid: ${validationResults.isValid}`);
      return;
    }

    const {
      whaleCount,
      score,
      tokenDetails,
      scoreBreakdown,
      differentialBreakdown,
      tokenPnlAndWinrate,
    } = validationResults;

    this.logger.debug(`handleLargeBuyCall tokenPnlAndWinrate: ${JSON.stringify(tokenPnlAndWinrate)}`);

    if (!differentialBreakdown) {
      this.logger.debug(`Token was not found in cache. Differential breakdown: ${differentialBreakdown}`);
      return;
    }

    this.logger.debug(`Differential breakdown: ${differentialBreakdown}`);
    this.logger.debug(`Large Sell call proceed for: ${notification.tokenAddress}`);

    // await this.alertProcessingService.processTokenAlert(
    //   notification,
    //   notificationTypeText,
    //   filtersToApply,
    //   whaleCount,
    //   score,
    //   tokenDetails,
    //   scoreBreakdown,
    //   differentialBreakdown,
    //   tokenPnlAndWinrate,
    // );
  }
}
