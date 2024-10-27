import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import constants from '@shared/constants';
import { PumpfunService } from '../pumpfun/pumpfun.service';
import { PlatformAddresses } from '@shared/enums';

@Injectable()
export class RugCheckService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private cachedReport: { [key: string]: any } = {};
  private reportFetchCount = 0;


  constructor(
    private readonly configService: ConfigService,
    private readonly pumpfunService: PumpfunService,
  ) {
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchTokenReport(token: string): Promise<any> {
    if (this.cachedReport[token]) {
      return this.cachedReport[token];
    }

    const baseUrl = this.configService.get<string>('blockchain.rugCheck.baseUrl');
    const url = `${baseUrl}/tokens/${token}/report`;

    let attempt = 0;
    while (attempt < this.RETRY_ATTEMPTS) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        this.cachedReport[token] = data;
        this.reportFetchCount++;
        return data;
      } catch (error) {
        attempt++;
        await this.delay(this.RETRY_DELAY_MS);
      }
    }

    throw new Error(`Failed to fetch report for token: ${token} after ${this.RETRY_ATTEMPTS} attempts`);
  }

  async getMintAuthority(tokenAddress: string): Promise<string | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.token?.mintAuthority || null;
  }

  async getFreezeAuthority(tokenAddress: string): Promise<string | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.token?.freezeAuthority || null;
  }

  async getSupply(tokenAddress: string): Promise<number | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.token?.supply || null;
  }

  async getImage(tokenAddress: string): Promise<string | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.fileMeta?.image || null;
  }

  async getDecimals(tokenAddress: string): Promise<number | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.token?.decimals || null;
  }

  async getLiquidity(tokenAddress: string): Promise<number | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.totalMarketLiquidity || null;
  }

  async getLiquidityLock(tokenAddress: string) {
    const report = await this.fetchTokenReport(tokenAddress);
    if (!report?.markets?.length) {
      this.logger.error(`No market data available for token: ${tokenAddress}`);
      return { lpLockedUsd: 0, lpLockedPercentage: 0 };
    }

    const market = report.markets[0];
    const lpLockedUsd = market.lp.lpLockedUSD;
    const lpTotalSupply = market.lp.lpTotalSupply;
    const lpLocked = market.lp.lpLocked;
    const lpLockedPct = lpTotalSupply === 0 ? 0 : (lpLocked / lpTotalSupply) * 100;
    return { lpLockedUsd, lpLockedPercentage: lpLockedPct };
  }

  async getMutable(tokenAddress: string): Promise<boolean | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.tokenMeta?.mutable ?? null;
  }

  async isTokenRug(tokenAddress: string): Promise<boolean | null> {
    const report = await this.fetchTokenReport(tokenAddress);
    return report?.rugged || null;
  }

  async getTopHoldersAddresses(tokenAddress: string): Promise<string[]> {
    const report = await this.fetchTokenReport(tokenAddress);
    const uniqueHolders = new Set<string>();

    for (const holder of report.topHolders || []) {
      if (!Object.values(PlatformAddresses).includes(holder.owner)) {
        uniqueHolders.add(holder.owner);
      }
      if (uniqueHolders.size === 20) {
        break;
      }
    }

    return Array.from(uniqueHolders);
  }

  async getTopHoldersPercentage(tokenAddress: string): Promise<number> {
    const report = await this.fetchTokenReport(tokenAddress);
    const totalSupply = report.token.supply || 1;
    const top10Supply = (report.topHolders || []).slice(0, 10).reduce((sum, holder) => sum + holder.amount, 0);
    return (top10Supply / totalSupply) * 100;
  }

  async getDevWalletAddress(tokenAddress: string): Promise<string | null> {
    this.logger.debug(`Fetching token report for token: ${tokenAddress}`);
    // First, check with Pumpfun service
    const creatorFromPumpfun = await this.pumpfunService.getDevWalletAddress(tokenAddress);
    if (creatorFromPumpfun) {
      if (constants.solana.ignore_creator_addresses.includes(creatorFromPumpfun)) {
        this.logger.warn(`Creator wallet ${creatorFromPumpfun} is in the ignored list for token: ${tokenAddress}`);
        return null;
      }
      return creatorFromPumpfun;
    }
    const report = await this.fetchTokenReport(tokenAddress);
    const creator = report?.creator || report?.tokenMeta?.updateAuthority;
    if (!creator) {
      this.logger.error(`Both creator and update authority are not found for token: ${tokenAddress}`);
      return null;
    }

    if (constants.solana.ignore_creator_addresses.includes(creator)) {
      this.logger.warn(`Creator wallet ${creator} is in the ignored list for token: ${tokenAddress}`);
      return null;
    }

    return creator;
  }

  async isTokenValid(tokenAddress: string): Promise<boolean> {
    try {
      const baseUrl = this.configService.get<string>('blockchain.rugCheck.baseUrl');
      const response = await fetch(`${baseUrl}/tokens/${tokenAddress}/report`);
      return response.ok;
    } catch {
      return false;
    }
  }

}