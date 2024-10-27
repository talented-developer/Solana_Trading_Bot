import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Direction, SwapDetailsDTO } from '@shared/types/swap-details';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SolscanService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService,
              private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('blockchain.solscan.baseUrl');
    this.apiKey = this.configService.get<string>('blockchain.solscan.apiKey_v2');
    this.httpService.axiosRef.defaults.headers.common['token'] = this.apiKey;
  }

  async getTotalTokenHolders(tokenAddress: string): Promise<number> {
    this.logger.log(`Getting total token holders for ${tokenAddress}`);
    const url = `${this.baseUrl}/token/holders`;
    const params = {
      address: tokenAddress,
    };
    const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url, { params }));
    const data = response?.data;

    return data?.success ? data.data.total : 0;
  }

  private validatePageSize(pageSize: number): number {
    const allowedSizes = [10, 20, 30, 40, 60, 100];
    return allowedSizes.includes(pageSize) ? pageSize : 20;
  }

  async getDefiActivities(swapDetailsParams: SwapDetailsParams): Promise<any> {
    const {
      walletAddress,
      fromAddress,
      tokenAddress,
      page = 1,
      pageSize = 100,
    } = swapDetailsParams;

    const validatedPage = Math.max(1, page);
    const validatedPageSize = this.validatePageSize(pageSize);

    const url = `${this.baseUrl}/token/defi/activities`;
    const params: any = {
      address: walletAddress,
      page: validatedPage.toString(),
      page_size: validatedPageSize.toString(),
    };

    if (fromAddress) params.from = fromAddress;
    if (tokenAddress) params.token = tokenAddress;

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url, { params }));

      if (!response?.data?.success) {
        this.logger.error('Error response from Solscan API: ', response?.data?.errors);
        return { data: [], success: false };
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error('Error fetching defi activities: ', error.response.status, error.response.data);
      } else {
        this.logger.error('Error fetching defi activities: ', error.message);
      }
      return { data: [], success: false };
    }
  }

  async getWhalesTokenAccounts(walletAddress: string, pageSize: number = 40): Promise<TokenAccount[]> {
    const url = `${this.baseUrl}/account/token-accounts`;
    const accounts: TokenAccount[] = [];
    let requestCount = 0;

    for (let page = 1; page <= 2; page++) {
      const params = {
        address: walletAddress,
        page: page.toString(),
        page_size: pageSize.toString(),
        type: 'token',
        hide_zero: 'true',
      };

      try {
        const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url, { params }));
        requestCount++;

        if (response?.data?.success) {
          const fetchedAccounts = response.data.data;
          if (fetchedAccounts.length === 0) break;
          accounts.push(...fetchedAccounts);
        } else {
          this.logger.error('Error response from Solscan API: ', response?.data?.errors || 'Unknown error');
        }
      } catch (error) {
        this.logger.error('Error fetching token accounts: ', error?.response?.data || error.message || 'Unknown error');
        break;
      }
    }

    this.logger.log(`Request count for getTokenAccounts: ${requestCount}`);
    return accounts;
  }

  async getAccountDetail(walletAddress: string): Promise<any> {
    const url = `${this.baseUrl}/account/detail`;
    const params: any = {
      address: walletAddress,
    };

    this.logger.log(`Fetching account detail for address ${walletAddress}`);

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url, { params }));

      if (!response || !response.data) {
        this.logger.error('Invalid response from Solscan API: ', response);
        return null;
      }

      if (!response.data.success) {
        this.logger.error('Error response from Solscan API: ', response.data.errors);
        return { data: [], success: false }; // or return null if appropriate
      }

      return {
        data: response.data.data,
        success: response.data.success,
      };
    } catch (error) {
      this.logger.error('Error fetching account detail: ', error.response?.data, error);
      return null;
    }
  }


  async getSwapDetails(params: SwapDetailsParams):
    Promise<SwapDetailsDTO[]> {
    const { walletAddress } = params;

    const { data } = await this.getDefiActivities(params);
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((activity: any) => {
      const routers = activity.routers || {};
      const childRouters = routers.child_routers?.[0] || {};

      return {
        signatures: [],
        signers: [],
        buyToken: routers.token1 ? {
          tokenAddress: routers.token1,
          decimals: routers.token1_decimals || 0,
          amount: routers.amount1,
          symbol: routers.token1_symbol || 'unknown',
        } : undefined,
        sellToken: routers.token2 ? {
          tokenAddress: routers.token2,
          decimals: routers.token2_decimals || 0,
          amount: routers.amount2,
          symbol: routers.token2_symbol || 'unknown',
        } : undefined,
        timestamp: activity.block_time,
        direction: activity.from_address === walletAddress ? Direction.BUY : Direction.SELL,
        recipient: walletAddress,
      };
    });
  }

}

export interface SwapDetailsParams {
  walletAddress: string;
  fromAddress?: string;
  tokenAddress?: string;
  page?: number;
  pageSize?: number;
}

export interface TokenAccount {
  token_account: string;
  token_address: string;
  amount: number;
  token_decimals: number;
  owner: string;
}
