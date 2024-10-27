import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

//TODO: Not in use. https://solintel.io/documentation we can get renounce ownership, total burnt
@Injectable()
export class SolintelApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('blockchain.solintel.baseUrl');
    this.apiKey = this.configService.get<string>('blockchain.solintel.apiKey');
    httpService.axiosRef.defaults.headers.common['token'] = this.apiKey;
  }

  async getDefiActivities(walletAddress: string, fromAddress?: string, tokenAddress?: string, page: number = 1, pageSize: number = 20): Promise<any> {
    const url = `${this.baseUrl}/v2.0/token/defi/activities`;
    const params: any = {
      address: walletAddress,
      page: page.toString(),
      page_size: pageSize.toString(),
    };

    if (fromAddress) {
      params.from = fromAddress;
    }
    if (tokenAddress) {
      params.token = tokenAddress;
    }

    const response = await firstValueFrom(this.httpService.get(url, { params }));
    return response.data;
  }
}
