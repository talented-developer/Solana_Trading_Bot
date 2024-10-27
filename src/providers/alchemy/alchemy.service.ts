import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';

/**
 * https://docs.alchemy.com/reference/solana-api-endpoints#token-information
 * */
@Injectable()
export class AlchemyService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly connection: Connection;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('blockchain.alchemy.baseUrl');
    this.apiKey = this.configService.get<string>('blockchain.alchemy.apiKey');
    const rpcUrl = `${this.baseUrl}/${this.apiKey}`;
    this.connection = new Connection(rpcUrl, 'confirmed');

    this.httpService.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
  }

  async getLatestSlot(): Promise<number> {
    return await this.connection.getSlot();
  }

  async getProgramAccounts(programId: string): Promise<any[]> {
    let programAccounts = [];
    const requestPayload = {
      method: 'alchemy_getProgramAccounts',
      params: [
        programId,
        {
          encoding: 'base64',
          withContext: true,
          order: 'desc',
        } as { encoding: string; withContext: boolean; order: string; pageKey?: string },
      ],
      id: 0,
      jsonrpc: '2.0',
    };

    try {
      const response = await this.httpService.post(this.baseUrl, requestPayload).toPromise();
      let responseData = response.data.result;
      while (responseData.pageKey) {
        programAccounts = programAccounts.concat(responseData.value);
        (requestPayload.params[1] as any).pageKey = responseData.pageKey;
        const nextResponse = await this.httpService.post(this.baseUrl, requestPayload).toPromise();
        responseData = nextResponse.data.result;
      }

      programAccounts = programAccounts.concat(responseData.value);
      return programAccounts;
    } catch (error) {
      console.error(`Error fetching program accounts: ${error.message}`);
      return [];
    }
  }


  async getTrendingTokens(): Promise<any> {
    // Implement logic here to determine what constitutes "trending tokens"
    // For instance, you might analyze the most active token accounts, recent transaction volume, etc.
    // This is a placeholder function that needs to be customized based on your definition of "trending"
    const trendingTokens = await this.getProgramAccounts('<your-program-id-for-trending-tokens>');
    return trendingTokens;
  }
}