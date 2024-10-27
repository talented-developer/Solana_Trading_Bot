import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MarkupButtonsService } from '../buttons/button.service';
import { TextService } from '../text/text.service';
import { GlobalFilterService } from '../global-filter/global-filter.service';
import { UserRepository } from '../../../db/repository/user.repository';
import { ScoreManager } from '../../managers/score-manager';
import { TokenDetailsService } from '../token-details/token-details.service';
import { CommandsService } from '../commands/commands.service';
import constants from '@shared/constants';
import { NotificationDto } from '@shared/types/notification-alert';
import { WhaleDetectionService } from '../whale-detection/whale-detection.service';
import { I18nService } from 'nestjs-i18n';
import { AlertSettingsRepository } from '../../../db/repository/alert-settings.repository';
import { MarketCapRanges } from '@shared/iunterfaces/marketcap';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(forwardRef(() => CommandsService))
    private readonly commandsService: CommandsService,
    private readonly tokenFilterService: GlobalFilterService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly i18n: I18nService,
    private readonly userService: UserRepository,
    private readonly scoreManager: ScoreManager,
    private readonly tokenService: TokenDetailsService,
    private readonly whaleDetectionService: WhaleDetectionService,
    private readonly alertSettingsService: AlertSettingsRepository,
  ) {
  }

  async processTokenAlert(
    notification: NotificationDto,
    notificationTypeText: string,
    filtersToApply,
    whaleCount,
    score,
    tokenDetails,
    scoreBreakdown?,
    differentialBreakdown?,
    tokenPnlAndWinrate?,
  ) {
    const alertText = await this.getAlertText(tokenDetails, notificationTypeText, whaleCount, score, tokenPnlAndWinrate, scoreBreakdown, differentialBreakdown);
    const buttons = await this.markupButtonsService.tradeButton(notification.tokenAddress, tokenDetails.tokenMetadata.json?.symbol.toUpperCase());
    const [goldChatIds, adminChatIds] = await this.getChatIds();
    await this.sendAlertsToTier(goldChatIds, 'Gold', alertText, buttons);
    await this.sendAlertsToTier(adminChatIds, 'Admin', alertText, buttons);
  }


  async getAlertText(tokenDetails, notificationTypeText, whaleCount, score, tokenPnlAndWinrate, scoreBreakdown?, differentialBreakdown?) {
    const tokenMetadata = tokenDetails.tokenMetadata;
    const tokenAddress = tokenMetadata.address;
    const tokenLinks = this.tokenService.getTokenLinks(tokenAddress);
    // const scoreBreakdownText = scoreBreakdown.length ? scoreBreakdown.map(item => `${item.metric}: ${item.points}/${item.maxPoints}`).join('\n') + '\n\n' : '';
    // this.logger.debug(`differentialBreakdown: ${differentialBreakdown}`);
    // const differentialBreakdownText = differentialBreakdown ? Object.entries(differentialBreakdown).map(([key, value]) => `${key}: ${value ?? ''}`).join('\n') + '\n\n' : ''; // not displaying differential breakdown message too big
    // this.logger.debug(`differentialBreakdownText: ${differentialBreakdownText}`);
    // const differentialBreakdownText = differentialBreakdown?.volumeSignal || '';
    const tokenSymbol = tokenDetails.tokenMetadata.json?.symbol.toUpperCase();
    const lpRatioNumber = Math.round(tokenDetails.liquidityRatio);
    return {
      type_of_call: notificationTypeText || '',
      token_image: tokenDetails.image || tokenDetails.imageUrl || '',
      token_name: tokenDetails.tokenMetadata.json?.name,
      market_name: tokenDetails?.marketName || '',
      token_address: tokenDetails.tokenMetadata.address,
      token_symbol: tokenSymbol,
      score,
      // score_breakdown: scoreBreakdownText,
      // differential_breakdown: differentialBreakdownText,
      market_cap: tokenDetails.formattedMarketCap,
      market_cap_raw: tokenDetails.marketCapValue,
      liquidityRatio: `${lpRatioNumber}%`,
      token_age: tokenDetails.tokenAge,
      top_10_holders: tokenDetails.formattedTop10holders,
      creator_percentage: tokenDetails.devWalletPercentage,
      number_holders: tokenDetails.formatNumberOfHolders,
      liquidity_lock_percentage: tokenDetails.liquidity_lock_percentage,
      liquidity: tokenDetails.formattedLiquidity,
      supply: tokenDetails.formattedSupply,
      price_change_5min: tokenDetails.priceChange5min,
      price_trend: tokenDetails.priceTrend5min,
      price_change_1hr: tokenDetails.priceChange1Hr,
      price_change_24hr: tokenDetails.priceChange24Hr,
      volume_5min: tokenDetails.volume5min,
      // volume_trend: tokenDetails.volume5minTrend,
      volume_1hr: tokenDetails.volume1Hr,
      volume_24hr: tokenDetails.volume24Hr,
      mint_authority: tokenDetails.mintAuthority ? 'Yes' : 'No',
      is_mutable: tokenDetails.tokenMetadata.isMutable ? 'Yes' : 'No',
      freeze_status: tokenDetails.tokenMetadata.freezeAuthorityAddress || 'No',
      win_rate: tokenPnlAndWinrate.winRate,
      ath: tokenDetails.formattedAth,
      // LINKS
      x_com_link: tokenDetails.tokenMetadata.twitter || tokenDetails.twitterUrl || '',
      telegram: tokenDetails.tokenMetadata.telegram || tokenDetails.telegramUrl || '',
      website: tokenDetails.tokenMetadata.website || tokenDetails.websiteUrl || '',
      dexscreen: tokenLinks.dex_screen,
      dextools: tokenLinks.dex_tools,
      birdeye: tokenLinks.birdseye,
      check_dex: tokenLinks.checkDex,
      holder_scan: tokenLinks.holderScan,
      pump_fun: tokenLinks.pumpFun,
      rug_check: tokenLinks.rugCheck,
      ttf_bot: tokenLinks.ttfBot,
      solscan: tokenLinks.solscan,
      bublemaps: tokenLinks.bublemaps,
      x_com_mentions: `${tokenLinks.x_com_mentions}${tokenDetails.tokenMetadata.json?.name}`,

      //WHALE INFO
      whale_details: whaleCount || 0,
    };
  }

  private async sendAlertsToTier(telegramIds: bigint[] | bigint, tier: string, alertText: any, buttons) {
    const idsArray = Array.isArray(telegramIds)
      ? telegramIds
      : [telegramIds];
    const delay = this.getDelayForTier(tier);
    for (const telegramId of idsArray) {
      const isAlertValid = await this.isValidAlert(telegramId, tier, alertText);
      if (!isAlertValid) continue;
      await this.sendAlertToChat(telegramId, alertText, buttons);

      if (delay > 0) {
        await this.delayExecution(delay);
      }
    }
  }


  private async isValidAlert(telegramId: bigint, tier: string, alertText: any): Promise<boolean> {
    if (tier === 'Gold' || tier === 'Admin') {
      return this.validateWithMarketCapSettings(telegramId, alertText);
    }
    return false;
  }

  private async validateWithMarketCapSettings(telegramId: bigint, alertText: any): Promise<boolean> {
    const alertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];

    if (!alertSettings) {
      this.logger.error(`No alert settings found for user: ${telegramId}`);
      return false;
    }

    this.logger.debug(`Fetched alert settings for user ${telegramId}: ${JSON.stringify(alertSettings)}`);

    const userMarketCapRanges = alertSettings.marketCapRanges
      ? alertSettings.marketCapRanges.split(',').map(range => range.trim())
      : [];

    this.logger.debug(`User market cap ranges: ${JSON.stringify(userMarketCapRanges)}`);

    if (!Array.isArray(userMarketCapRanges) || userMarketCapRanges.length === 0) {
      this.logger.error(`No valid market cap ranges found for user: ${telegramId}`);
      return false;
    }

    let validationResults = [];

    const isWithinRange = userMarketCapRanges.some(rangeId => {
      const marketCapRange = this.getMarketCapRangesByIds([rangeId]);
      if (!marketCapRange || marketCapRange.length === 0) {
        this.logger.error(`Market cap range not found for rangeId: ${rangeId}`);
        return false;
      }

      const [minCap, maxCap] = marketCapRange[0];
      this.logger.debug(`Validating rangeId: ${rangeId}, minCap: ${minCap}, maxCap: ${maxCap}`);

      const isValid = alertText.market_cap_raw >= minCap && (maxCap === null || alertText.market_cap_raw <= maxCap);

      validationResults.push({
        rangeId,
        minCap,
        maxCap,
        marketCap: alertText.market_cap_raw,
        isValid,
      });

      return isValid;
    });

    if (!isWithinRange) {
      this.logger.debug(`Alert market cap ${alertText.market_cap_raw} is outside the user's selected ranges. Skipping alert.`);
    }
    return isWithinRange;
  }

  private getMarketCapRangesByIds(ids: string[]): [number, number | null][] {
    const validIds = ids.filter(id => id.trim() !== '');
    const ranges = MarketCapRanges.filter(range => validIds.includes(range.id.toString()));
    return ranges.map(range => [range.lowerBound, range.upperBound]);
  }

  private async getChatIds(): Promise<[bigint[], bigint[]]> {
    const goldChatIds = await this.userService.getGoldTierChatIds();
    const adminChatIds = await this.userService.getAdminTierChatIds();

    return [goldChatIds, adminChatIds];
  }

  private async sendAlertToChat(chatId: bigint, alertText, buttons) {
    const message = await this.i18n.translate('i18n.calls_token_info', { args: alertText });

    await this.textService.sendAlertMessageToChatIdsWithButtons([chatId], message, false, {
      show_above_text: true,
      is_disabled: false,
    }, buttons)
      .catch(error => {
        if (error.response?.error_code === 403) {
          return;
        }
        this.logger.error(`Failed to send alert to chatId: ${chatId}`, error.stack);
      });
  }

  private getDelayForTier(tier: string): number {
    const delayMapping = {
      admin: constants.delays.admin,
      gold: constants.delays.gold,
    };
    return delayMapping[tier] || 0;
  }


  private async delayExecution(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
