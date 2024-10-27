import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { TokenResponse } from './types';

@Injectable()
export class DexscreenerService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private cachedMarketData: { [key: string]: TokenResponse } = {};
  private requestCount = 0;
  private readonly apiBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('blockchain.dexscreener.baseUrl');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchMarketDataByTokenAddress(tokenAddress: string): Promise<TokenResponse> {
    if (this.cachedMarketData[tokenAddress]) {
      this.logger.debug(`Returning cached market data for token: ${tokenAddress}`);
      return this.cachedMarketData[tokenAddress];
    }

    this.logger.debug(`Fetching new market data for token: ${tokenAddress}`);
    const url = `${this.apiBaseUrl}/tokens/${tokenAddress}`;

    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await firstValueFrom(this.httpService.get<TokenResponse>(url));
        const data = response.data;
        this.cachedMarketData[tokenAddress] = data;
        this.requestCount++;
        this.logger.debug(`Total requests: ${this.requestCount}`);
        return data;
      } catch (error) {
        this.logger.error(`Attempt ${attempt} to fetch market data for ${tokenAddress} failed: ${error.message}`);

        if (attempt < this.RETRY_ATTEMPTS) {
          this.logger.debug(`Retrying in ${this.RETRY_DELAY_MS / 1000} seconds... (Attempt ${attempt}/${this.RETRY_ATTEMPTS})`);
          await this.delay(this.RETRY_DELAY_MS);
        } else {
          this.logger.error(`Failed to fetch market data for ${tokenAddress} after ${this.RETRY_ATTEMPTS} attempts.`);
          throw error;
        }
      }
    }
  }

}