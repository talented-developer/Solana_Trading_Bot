import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PumpfunTokenDto } from '@shared/types/pumpfunTokenDTO';

@Injectable()
export class PumpfunService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly frontend_pumpfun: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.frontend_pumpfun = this.configService.get<string>('blockchain.frontend_pumpfun.baseUrl');
  }

  async getDevWalletAddress(tokenAddress: string): Promise<string | null> {
    if (!tokenAddress) {
      this.logger.warn('Token address is null or empty');
      return null;
    }

    const url = `${this.frontend_pumpfun}/${tokenAddress}`;
    try {
      const response = await axios.get<PumpfunTokenDto>(url);
      if (response.status === 200 && response.data.creator) {
        return response.data.creator;
      } else {
        this.logger.warn(`No creator found for token: ${tokenAddress}`);
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Request to Pumpfun failed for token: ${tokenAddress} with status ${error.response?.status}`, error.stack);
      } else {
        this.logger.error(`Unexpected error while fetching dev wallet for token: ${tokenAddress}`, error);
      }
      return null;
    }
  }
}