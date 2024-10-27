import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScoreManager {
  private readonly logger = new Logger(ScoreManager.name);
  private readonly config = {
    scoring: {
      basicInfo: {
        tokenImage: 2,
        tokenDescription: 2,
        twitter: 3,
        telegram: 3,
        website: 5,
      },
      totalHolders: {
        above5000: 15,
        between1001And5000: 10,
        between501And1000: 7,
        between101And500: 4,
        below100: 2,
      },
      top10Ownership: {
        below30: 20,
        between31And40: 15,
        between41And50: 8,
        between51And60: 4,
        above61: 0,
      },
      // top10WinRate: {
      //   below30: 0,
      //   between31And40: 4,
      //   between41And50: 8,
      //   between51And60: 15,
      //   above60: 20,
      // },
      whaleCount: {
        pointsPerWhale: 2,
      },
      tokenWinRate: {
        below20: 0,
        between21And49: 5, // TODO: FIX
        between50And75: 10,
        above75: 20,
      },
      tokenAgeBonus: {
        below24Hours: 20,
        between1DayAnd1Week: 5,
        between1WeekAnd1Month: 10,
        above1Month: 20,
      },
    },
  };

  async calculateTokenScore(
    tokenDetails: any,
    tokenPnlAndWinrate,
    whaleCount: number,
    debug = false):
    Promise<{
      score: string;
      scoreBreakdown?: { metric: string; points: number; maxPoints: number }[];
    }> {
    let score = 0;
    const scoreBreakdown = [];

    const addScore = (points: number, metric: string, maxPoints: number) => {
      score += points;
      if (debug) {
        scoreBreakdown.push({ metric, points, maxPoints });
      }
    };

    this.addBasicInfoScores(tokenDetails, addScore);
    this.addMarketDetailsScores(tokenDetails, tokenPnlAndWinrate, whaleCount, addScore);
    let finalScore = score / 10;
    finalScore = finalScore > 10 ? 10 : finalScore;
    return debug
      ? { score: finalScore.toFixed(1), scoreBreakdown }
      : { score: finalScore.toFixed(1) };
  }

  addBasicInfoScores(tokenDetails: any, addScore: (points: number, metric: string, maxPoints: number) => void) {
    addScore(this.getImagePoints(tokenDetails), 'Token Image', this.config.scoring.basicInfo.tokenImage);
    addScore(this.getDescriptionPoints(tokenDetails), 'Token Description', this.config.scoring.basicInfo.tokenDescription);
    addScore(this.getTwitterPoints(tokenDetails), 'Twitter', this.config.scoring.basicInfo.twitter);
    addScore(this.getTelegramPoints(tokenDetails), 'Telegram', this.config.scoring.basicInfo.telegram);
    addScore(this.getWebsitePoints(tokenDetails), 'Website', this.config.scoring.basicInfo.website);
  }

  addMarketDetailsScores(tokenDetails: any, tokenPnlAndWinrate, whaleCount: number, addScore: (points: number, metric: string, maxPoints: number) => void) {
    addScore(this.getTotalHoldersPoints(tokenDetails.numberHolders), 'Total Holders', this.config.scoring.totalHolders.above5000);
    addScore(this.getTop10CombinedOwnershipPoints(tokenDetails.formattedTop10holders), 'Top 10 Ownership', this.config.scoring.top10Ownership.below30);
    addScore(this.getTokenWinRatePoints(tokenPnlAndWinrate.winRate), 'Token Win Rate', this.config.scoring.tokenWinRate.above75);
    addScore(this.getWhaleScore(whaleCount), 'Whale Points', 20);
    addScore(this.getTokenAgeBonus(tokenDetails.ageOfTokenInSeconds / 3600), 'Age', this.config.scoring.tokenAgeBonus.above1Month);
  }


  getTokenAgeBonus(tokenAgeInHours: number): number {
    if (tokenAgeInHours < 24) return this.config.scoring.tokenAgeBonus.below24Hours;
    if (tokenAgeInHours >= 24 && tokenAgeInHours <= 168) return this.config.scoring.tokenAgeBonus.between1DayAnd1Week;
    if (tokenAgeInHours > 168 && tokenAgeInHours <= 720) return this.config.scoring.tokenAgeBonus.between1WeekAnd1Month;
    return this.config.scoring.tokenAgeBonus.above1Month;
  }

  getWhaleScore(whaleCount: number): number {
    const points = whaleCount * this.config.scoring.whaleCount.pointsPerWhale;
    return Math.min(points, 20);
  }

  getTotalHoldersPoints(numberHolders: number): number {
    if (numberHolders > 5000) return this.config.scoring.totalHolders.above5000;
    if (numberHolders >= 1001) return this.config.scoring.totalHolders.between1001And5000;
    if (numberHolders >= 501) return this.config.scoring.totalHolders.between501And1000;
    if (numberHolders >= 101) return this.config.scoring.totalHolders.between101And500;
    return this.config.scoring.totalHolders.below100;
  }

  getTop10CombinedOwnershipPoints(ownershipPercentage: number): number {
    this.logger.debug(`ownershipPercentage calculation in score manager: ${ownershipPercentage}`);

    if (ownershipPercentage >= 0 && ownershipPercentage <= 30) return this.config.scoring.top10Ownership.below30;
    if (ownershipPercentage >= 31 && ownershipPercentage <= 40) return this.config.scoring.top10Ownership.between31And40;
    if (ownershipPercentage >= 41 && ownershipPercentage <= 50) return this.config.scoring.top10Ownership.between41And50;
    if (ownershipPercentage >= 51 && ownershipPercentage <= 60) return this.config.scoring.top10Ownership.between51And60;
    if (ownershipPercentage >= 61) return this.config.scoring.top10Ownership.above61;

    return 0;
  }


  getTokenWinRatePoints(winRate: string): number {
    const winRateValue = parseFloat(winRate.replace('%', '').trim());

    if (winRateValue < 20) {
      return this.config.scoring.tokenWinRate.below20;
    } else if (winRateValue >= 20 && winRateValue < 50) {
      return this.config.scoring.tokenWinRate.between21And49;
    } else if (winRateValue >= 50 && winRateValue <= 75) {
      return this.config.scoring.tokenWinRate.between50And75;
    } else if (winRateValue > 75) {
      return this.config.scoring.tokenWinRate.above75;
    }

    return 0; // Возврат 0, если не попадает ни в один диапазон
  }

  private getImagePoints(tokenDetails: any): number {
    if (!tokenDetails || (!tokenDetails.image && !tokenDetails.imageUrl)) {
      return 0;
    }

    return this.config.scoring.basicInfo.tokenImage;
  }

  private getDescriptionPoints(tokenDetails: any): number {
    return tokenDetails.tokenMetadata.json?.description ? this.config.scoring.basicInfo.tokenDescription : 0;
  }

  private getTwitterPoints(tokenDetails: any): number {
    return tokenDetails.tokenMetadata.twitter || tokenDetails.twitterUrl ? this.config.scoring.basicInfo.twitter : 0;
  }

  private getTelegramPoints(tokenDetails: any): number {
    return tokenDetails.tokenMetadata.telegram || tokenDetails.telegramUrl ? this.config.scoring.basicInfo.telegram : 0;
  }

  private getWebsitePoints(tokenDetails: any): number {
    return tokenDetails.tokenMetadata.website || tokenDetails.websiteUrl ? this.config.scoring.basicInfo.website : 0;
  }
}