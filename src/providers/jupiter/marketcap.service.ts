import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketCapService {
  private readonly heliusBaseUrl: string;
  private readonly jupiterPriceApiUrlV6Agg: string;
  private readonly jupiterPriceApiUrlV2: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.heliusBaseUrl = this.configService.get<string>('blockchain.solana.rpcUrl');
    this.jupiterPriceApiUrlV6Agg = 'https://price.jup.ag/v6/price?ids=';
    this.jupiterPriceApiUrlV2 = 'https://api.jup.ag/price/v2?ids=';
  }

  async getMarketCapV2(tokenMintAddress: string): Promise<number> {
    const tokenSupply = await this.getTokenSupply(tokenMintAddress);
    const tokenPrice = await this.getTokenPrice(tokenMintAddress, this.jupiterPriceApiUrlV2);

    const marketCap = tokenSupply * tokenPrice;
    return marketCap;
  }

  async getMarketCap(tokenMintAddress: string): Promise<number> {
    const tokenSupply = await this.getTokenSupply(tokenMintAddress);
    const tokenPrice = await this.getTokenPrice(tokenMintAddress);

    const marketCap = tokenSupply * tokenPrice;
    return marketCap;
  }

  private async getTokenSupply(tokenMintAddress: string): Promise<number> {
    const response = await firstValueFrom(this.httpService.post(`${this.heliusBaseUrl}`, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenSupply',
      params: [tokenMintAddress],
    }));

    const supply = response.data.result.value.uiAmount;
    return supply;
  }

  private async getTokenPrice(tokenAddress: string, url = this.jupiterPriceApiUrlV6Agg, attempts = 3): Promise<number | null> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await firstValueFrom(this.httpService.get(url + tokenAddress));

        // console.log('Response: ', response.data);
        const price = response.data.data[tokenAddress]?.price;
        if (price !== undefined) {
          return price;
        } else {
          console.warn(`Price not found for token address: ${tokenAddress} on attempt ${attempt}`);
          return null;
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed for token address: ${tokenAddress}. Error:`, error.message);
        if (attempt === attempts) {
          console.error(`All attempts failed for token address: ${tokenAddress}.`);
          return null; // Return null after exhausting all attempts
        }
        // Optional: Add a delay before retrying
        await this.delay(1000); // Delay for 1 second before retrying
      }
    }

    return null; // Fallback return statement
  }

// Utility method to introduce a delay
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}