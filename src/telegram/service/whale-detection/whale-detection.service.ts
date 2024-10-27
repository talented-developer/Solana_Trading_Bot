import { Injectable, Logger } from '@nestjs/common';
import { RugCheckService } from '../../../providers/rug-check/rug-check.service';
import { JupiterService } from '../../../providers/jupiter/jupiter.service';
import { ShyftApiService } from '../../../providers/shyft/shyft-api.service';
import { thresholdValues } from '../../../../shared/types/threshold';
import { BirdeyeService } from '../../../providers/birdeye/birdeye.service';

@Injectable()
export class WhaleDetectionService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly requestDelay = 1000;

  constructor(
    private readonly rugCheckService: RugCheckService,
    private readonly jupiterService: JupiterService,
    private readonly shyftApiService: ShyftApiService,
    private readonly birdeyeService: BirdeyeService,
  ) {
  }

  async getWhalesAddresses(tokenAddress: string): Promise<number> {
    const topHoldersAddresses = await this.rugCheckService.getTopHoldersAddresses(tokenAddress);
    let whaleCount = 0;

    for (const holderAddress of topHoldersAddresses) {
      const balance = await this.birdeyeService.getWalletPortfolio(holderAddress);
      if (balance !== null && balance > thresholdValues.whaleUsdBalance) {
        whaleCount++;
      }

      await this.delay(this.requestDelay);
    }

    return whaleCount;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
