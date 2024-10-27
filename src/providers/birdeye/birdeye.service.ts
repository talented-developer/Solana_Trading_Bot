import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BirdeyeService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly maxRetries: number = 5; // Add maxRetries property
  private readonly delayMs: number = 1000; // Delay in milliseconds

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('blockchain.birdeye.baseUrl');
    this.apiKey = this.configService.get<string>('blockchain.birdeye.apiKey');
  }

  private async fetchPriceHistory(
    tokenAddress: string,
    timeFrom: number,
    timeTo: number,
    intervalType: string,
  ): Promise<number[]> {
    const url = `${this.apiBaseUrl}/defi/history_price`;
    const params = new URLSearchParams({
      address: tokenAddress,
      address_type: 'token',
      type: intervalType,
      time_from: timeFrom.toString(),
      time_to: timeTo.toString(),
    }).toString();

    try {
      // this.logger.debug(`Sending request to: ${url}?${params}`);
      const { data } = await firstValueFrom(this.httpService.get(`${url}?${params}`, {
        headers: {
          'accept': 'application/json',
          'x-chain': 'solana',
          'X-API-KEY': this.apiKey,
        },
      }));

      if (!data.success || !data.data.items) {
        this.logger.error(`API Error: ${data.error || 'Unknown error'}`);
        return [];
      }

      const prices = data.data.items.map(item => item.value);
      this.logger.debug(`Prices fetched: ${JSON.stringify(prices)}`);
      return prices;
    } catch (err) {
      this.logger.error(`Error fetching price history: ${err.message}`);
      return [];
    }
  }

  private async getMaxPriceByInterval(tokenAddress: string, timeFrom, timeTo, intervalType: string): Promise<number> {
    this.logger.debug(`Fetching price history from ${timeFrom} to ${timeTo} for interval: ${intervalType}`);
    const prices = await this.fetchPriceHistory(tokenAddress, timeFrom, timeTo, intervalType);
    if (prices.length > 0) {
      return Math.max(...prices);
    }
    return 0;
  }


  async getMaxPrice(tokenAddress: string, timeTo, timeFromInSeconds, ageOfTokenInSeconds): Promise<number | null> {
    if (ageOfTokenInSeconds <= 3600) {
      return this.getMaxPriceByInterval(tokenAddress, timeFromInSeconds, timeTo, '1m');
    } else if (ageOfTokenInSeconds <= 86400) {
      return this.getMaxPriceByInterval(tokenAddress, timeFromInSeconds, timeTo, '15m');
    }
    // return this.getMaxPriceByInterval(tokenAddress, timeFromInSeconds, timeTo, '1D');
    return this.getMaxPriceByInterval(tokenAddress, timeFromInSeconds, timeTo, '1H');
  }


  // HOLDINGS DETECTION // TODO: add to portoflio this
  async getWalletPortfolio(walletAddress: string): Promise<number | null> {
    const url = `${this.apiBaseUrl}/v1/wallet/token_list?wallet=${walletAddress}`;
    this.logger.debug(`Requesting wallet portfolio from URL: ${url}`);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const { data } = await firstValueFrom(this.httpService.get(url, {
          headers: {
            'accept': 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': this.apiKey,
          },
        }));

        this.logger.debug(`Wallet portfolio fetched: ${data.data.totalUsd}`);
        return data.data.totalUsd;
      } catch (err) {
        if (err.response?.status === 429) {
          this.logger.warn(`Received 429 error, retrying... (Attempt ${attempt + 1})`);
          await this.delay(this.delayMs * (attempt + 1)); // Exponential backoff
        } else {
          this.logger.error(`Error fetching wallet portfolio: ${err.message}`);
          return null;
        }
      }
    }

    this.logger.error('Max retries reached, unable to fetch wallet portfolio.');
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchTokenTradeData(walletAddress: string) {
    const url = `${this.apiBaseUrl}/defi/v3/token/trade-data/single?address=${walletAddress}`;
    this.logger.debug(`Requesting token trade data from URL: ${url}`);

    try {
      const { data } = await firstValueFrom(this.httpService.get(url, {
        headers: {
          'accept': 'application/json',
          'x-chain': 'solana',
          'X-API-KEY': this.apiKey,
        },
      }));

      if (!data.success) {
        this.logger.error(`API Error: ${data.error || 'Unknown error'}`);
        return null;
      }

      return data.data;
    } catch (err) {
      this.logger.error(`Error fetching token trade data: ${err.message}`);
      return null;
    }
  }
}