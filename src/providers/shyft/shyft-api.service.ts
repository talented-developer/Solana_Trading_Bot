import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Api, ApiConfig } from './Api';
import { firstValueFrom } from 'rxjs';
import { UtilsService } from '../../telegram/service/utils/utils.service';

@Injectable()
export class ShyftApiService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly baseUrl: string;
  private readonly api: Api<unknown>;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly utilsService: UtilsService,
  ) {
    this.baseUrl = this.configService.get<string>('blockchain.shyft.baseUrl');

    const apiConfig: ApiConfig = {
      baseUrl: this.baseUrl,
    };

    this.api = new Api(apiConfig);
  }

  private getDefaultHeaders() {
    const apiKey = this.configService.get<string>('blockchain.shyft.apiKey');
    return {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'x-api-key': apiKey,
    };
  }

  async fetchAssociatedTokenAccountsAndNativeBalance(
    topHoldersAddress: string,
    network: string = 'mainnet-beta',
  ): Promise<{ address: string; balance: number; decimals: number; }[]> {
//    this.logger.debug(`Fetching token accounts and native balance for address: ${topHoldersAddress}`);
    const rpcUrl = `${this.baseUrl}/sol/v1/wallet/all_tokens?network=${network}&wallet=${topHoldersAddress}`;

    const fetchPromise = firstValueFrom(
      this.httpService.get(rpcUrl, { headers: this.getDefaultHeaders() }),
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Response took too long')), 5000),
    );

    try {
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      //    this.logger.debug(`Fetched ${associatedAccounts.length} associated accounts for address: ${topHoldersAddress}`);
      return (response.data?.result || [])
        .map(account => ({
          address: account.address,
          balance: account.balance,
          decimals: account.info.decimals,
        }))
        .filter(account => account.address && account.balance !== undefined && account.decimals !== undefined);
    } catch (error) {
      this.logger.error(`Error fetching token accounts for address ${topHoldersAddress}: ${error.message}`);
      return [];
    }
  }

}


