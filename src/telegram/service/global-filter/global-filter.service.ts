import { Injectable, Logger } from '@nestjs/common';
import { RugCheckService } from '../../../providers/rug-check/rug-check.service';
import { Metadata } from '@shared/types/metadata';
import { TokenMetadataService } from '../../../providers/utils/fetch-token-metadata';
import { DexscreenerService } from '../../../providers/dexscreener/dexscreener.service';
import { NotificationType, TokenFilterType } from '@shared/types/notification-alert';
import { SolscanService } from '../../../providers/solscan/solscan.service';
import { ScoreManager } from '../../managers/score-manager';
import { TokenDetailsService } from '../token-details/token-details.service';
import { WhaleDetectionService } from '../whale-detection/whale-detection.service';
import { RedisService } from '../../../db/services/redis.service';
import { thresholdValues } from '../../../../shared/types/threshold';


@Injectable()
export class TokenFilter {
  constructor(
    public name: string,
    public check: (data: any, config: any) => boolean,
    public value?: any,
  ) {
  }
}

@Injectable()
export class GlobalFilterService {
  private readonly logger = new Logger(GlobalFilterService.name);

  constructor(
    private readonly rugCheckService: RugCheckService,
    private readonly tokenMetadataService: TokenMetadataService,
    private readonly dexscreenerService: DexscreenerService,
    private readonly redisCache: RedisService,
    private readonly solscanService: SolscanService,
    private readonly scoreManager: ScoreManager,
    private readonly tokenService: TokenDetailsService,
    private readonly whaleDetectionService: WhaleDetectionService,
  ) {
  }


  private getThresholdValue(filterName: TokenFilterType) {
    switch (filterName) {
      case TokenFilterType.MinLiquidityFilter:
        return thresholdValues.liquidityThreshold;
      case TokenFilterType.IsMutable:
        return thresholdValues.mutable;
      case TokenFilterType.MintFilter:
        return thresholdValues.mintAuthority;
      case TokenFilterType.FreezeAuthority:
        return thresholdValues.freezeAuthority;
      case TokenFilterType.LiquidityLock:
        return thresholdValues.liquidityLockThreshold;
      case TokenFilterType.LiquidityRatio:
        return thresholdValues.liquidityRatioThreshold;
      case TokenFilterType.VolumeBuySpike:
        return thresholdValues.volumeSpikeBuyThreshold;
      case TokenFilterType.VolumeSellSpike:
        return thresholdValues.volumeSpikeSellThreshold;
      case TokenFilterType.DevWalletValue:
        return thresholdValues.devWalletPercentageThreshold;
      case TokenFilterType.NumberOfHolders:
        return thresholdValues.numberOfHolders;
      case TokenFilterType.ScoreFilter:
        return thresholdValues.scoreThreshold;
      case TokenFilterType.BuyVolumeCount:
        return thresholdValues.buyVolumeCount;
      case TokenFilterType.PriceChange:
        return thresholdValues.priceChange;
      default:
        return undefined;
    }
  }

  private getFilters(metadata: Metadata, data: any) {
    return [
      new TokenFilter(TokenFilterType.MarketNameFilter,
        () => data.marketName === 'Raydium', data.marketName),
      new TokenFilter(TokenFilterType.MinLiquidityFilter,
        () => data.liquidity != null && data.liquidity >= this.getThresholdValue(TokenFilterType.MinLiquidityFilter), data.liquidity ?? 'N/A'),
      new TokenFilter(TokenFilterType.IsMutable,
        () => data.mutable === this.getThresholdValue(TokenFilterType.IsMutable), data.mutable ?? 'N/A'),
      new TokenFilter(TokenFilterType.MintFilter,
        () => data.mintAuthority === this.getThresholdValue(TokenFilterType.MintFilter), data.mintAuthority),
      new TokenFilter(TokenFilterType.FreezeAuthority,
        () => data.freezeAuthority === this.getThresholdValue(TokenFilterType.FreezeAuthority), data.freezeAuthority),
      new TokenFilter(TokenFilterType.LiquidityLock,
        () => data.lpLockedData?.lpLockedPercentage >=
          this.getThresholdValue(TokenFilterType.LiquidityLock), data.lpLockedData?.lpLockedPercentage ?? 0),
      new TokenFilter(TokenFilterType.LiquidityRatio,
        () => {
          const lpRatio = data.liquidityRatio || 0;
          const threshold = this.getThresholdValue(TokenFilterType.LiquidityRatio);
          return lpRatio >= threshold;
        },
        data.liquidityRatio ?? 0),

      new TokenFilter(TokenFilterType.VolumeBuySpike,
        () => {
          return data.spikeBuyInVol >= this.getThresholdValue(TokenFilterType.VolumeBuySpike);
        }, data.spikeBuyInVol), new TokenFilter(TokenFilterType.VolumeSellSpike,
        () => {
          return data.spikeSellInVol <= this.getThresholdValue(TokenFilterType.VolumeSellSpike);
        }, data.spikeSellInVol),
      new TokenFilter(TokenFilterType.DevWalletValue,
        () => data.devWalletValue <= this.getThresholdValue(TokenFilterType.DevWalletValue),
        data.devWalletValue ?? 0),
      new TokenFilter(TokenFilterType.NumberOfHolders,
        () => data.numberHolders >= this.getThresholdValue(TokenFilterType.NumberOfHolders), data.numberHolders),
      new TokenFilter(TokenFilterType.BuyVolumeCount,
        () => data.primaryPair?.txns?.m5?.buys >= this.getThresholdValue(TokenFilterType.BuyVolumeCount), data.primaryPair?.txns?.m5?.buys),
      new TokenFilter(TokenFilterType.PriceChange,
        () => data.primaryPair?.priceChange?.m5 >= this.getPriceChangeThreshold(data), data.primaryPair?.priceChange?.m5),
      new TokenFilter(TokenFilterType.PriceChangePositive,
        () => data.primaryPair?.priceChange?.m5 > 0, data.primaryPair?.priceChange?.m5,
      ),
    ];
  }

  private getPriceChangeThreshold(data: { marketCapValue?: number; primaryPair?: { marketCap?: number } }): number {
    const marketcap = data?.marketCapValue || data?.primaryPair?.marketCap;
    return marketcap >= 1_000_000
      ? thresholdValues.priceChange
      : 2;
  }

  private getScoreFilter(data: any) {
    return [
      new TokenFilter(TokenFilterType.ScoreFilter, () => data.parsedScore >=
        this.getThresholdValue(TokenFilterType.ScoreFilter), data.parsedScore),
    ];
  }

  private validatingTokens: Set<string> = new Set();


  private applyFilters(tokenDetails: any, data: any, filtersToApply: TokenFilterType[]): boolean {
    const filters = this.getFilters(tokenDetails.tokenMetadata, data);
    const appliedFilters = filters.filter(filter => filtersToApply.includes(filter.name as TokenFilterType));

    for (const filter of appliedFilters) {
      if (!filter.check(data, thresholdValues)) {
        const expectedValue = this.getThresholdValue(filter.name as TokenFilterType);
        this.logger.debug(`Token ${tokenDetails.tokenMetadata.mint.address} failed filter '${filter.name}': expected ${expectedValue} but got ${filter.value}`);
        return false;
      }
    }
    return true;
  }

  private applyScoreFilters(score: any, data: any): boolean {
    const scoreValidation = this.getScoreFilter(score);

    for (const filter of scoreValidation) {
      if (!filter.check(data, thresholdValues)) {
        const expectedValue = this.getThresholdValue(filter.name as TokenFilterType);
        this.logger.debug(`Failed score filter '${filter.name}': expected ${expectedValue} but got ${filter.value}`);
        return false;
      }
    }
    return true;
  }

  async validateToken(tokenAddress: string, filtersToApply: TokenFilterType[], callType: NotificationType): Promise<{
    isValid: boolean,
    tokenDetails?: any,
    whaleCount?: any,
    score?: any,
    scoreBreakdown?: any,
    differentialBreakdown?: any,
    tokenPnlAndWinrate?: any,
    notificationTypeText?: string,
  }> {
    if (this.validatingTokens.has(tokenAddress)) {
      this.logger.debug(`Token ${tokenAddress} is already being validated. Ignoring this validation request.`);
      return { isValid: false };
    }

    this.validatingTokens.add(tokenAddress);
    try {
      const cacheKey = `token_count_${tokenAddress}`;
      const tokenDataStr = await this.redisCache.get(cacheKey);
      let tokenData = tokenDataStr ? JSON.parse(tokenDataStr) : null;

      // Если токен типа VOLUME_SPIKE, пропустите проверку кэша
      if (callType === NotificationType.VOLUME_SPIKE) {
        this.logger.debug(`Token ${tokenAddress} is VOLUME_SPIKE. Skipping cache validation.`);
      } else if (tokenData && this.redisCache.isTimestampValid(tokenData.timestamp)) {
        this.logger.debug(`Token ${tokenAddress} validated recently within the past 6 hours. Skipping further validation.`);
        return { isValid: false };
      }

      const tokenDetails = await this.tokenService.getTokenDetails(tokenAddress);
      if (!tokenDetails) {
        this.logger.debug(`Token ${tokenAddress} details not found, returning invalid status.`);
        return { isValid: false };
      }
      const tokenPnlAndWinrate = await this.tokenService.getTokenPnlAndWinRate(tokenAddress);
      const data = {
        marketName: tokenDetails?.marketName,
        mutable: tokenDetails.mutable,
        lpLockedData: tokenDetails.lpLockedData,
        liquidityRatio: tokenDetails.liquidityRatio,
        liquidity: tokenDetails.liquidity,
        devWalletValue: tokenDetails.devWalletPercentage,
        numberHolders: await this.solscanService.getTotalTokenHolders(tokenAddress),
        mintAuthority: tokenDetails.mintAuthority,
        freezeAuthority: tokenDetails.freezeAuthority,
        primaryPair: tokenDetails.primaryPair,
      };

      if (!this.applyFilters(tokenDetails, data, filtersToApply)) {
        return { isValid: false };
      }
      const whaleCount = await this.whaleDetectionService.getWhalesAddresses(tokenAddress);
      const scoreResult = await this.scoreManager.calculateTokenScore(tokenDetails, tokenPnlAndWinrate, whaleCount, true);
      const score = { parsedScore: parseFloat(scoreResult.score) };
      if (!this.applyScoreFilters(score, data)) {
        return { isValid: false };
      }

      const differentialBreakdown = await this.redisCache.getDiffBreakdown(tokenAddress, tokenDetails);
      await this.redisCache.setTokenCountWithTimestamp(tokenAddress);
      const tokenAge = tokenDetails.createdAtMilliseconds;
      let notificationTypeText;
      if (tokenAge >= 60 * 60 * 1000 &&
        tokenAge <= 3 * 60 * 60 * 1000 &&
        tokenDetails.marketName === 'Raydium'
      ) {
        notificationTypeText = NotificationType.RAYDIUM_TOKEN_LAUNCH;
      } else if (tokenDataStr) {
        notificationTypeText = NotificationType.LARGE_BUY;
      } else {
        notificationTypeText = NotificationType.NEW_CALL;
      }

      return {
        isValid: true,
        whaleCount,
        score: score.parsedScore,
        tokenDetails,
        scoreBreakdown: null,
        differentialBreakdown,
        tokenPnlAndWinrate,
        notificationTypeText,
      };
    } finally {
      this.validatingTokens.delete(tokenAddress);
    }
  }

}
