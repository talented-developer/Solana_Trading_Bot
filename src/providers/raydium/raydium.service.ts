import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RaydiumSwap from './raydiumSwap';
import { VersionedTransaction } from '@solana/web3.js';
import constants from '@shared/constants';


export const swapConfig = {
  executeSwap: false,
  useVersionedTransaction: true,
  tokenAAmount: 1,
  tokenAAddress: constants.solana.tokens.sol_token_address,
  liquiduityFile: 'https://api.raydium.io/v2/sdk/liquidity/mainnet.json', // !Warning 450mb
  maxLamports: 100000,
  direction: 'in' as 'in' | 'out',
  maxRetries: 20,
};

@Injectable()
export class RaydiumService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private configService: ConfigService) {
  }

  private async checkAndLoadData(): Promise<any> {
    // Mock implementation to simulate loading data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockData = {
          lastUpdated: Date.now(),
          data: {
            pools: [
              { id: 'pool1', tokenA: 'TokenA', tokenB: 'TokenB', liquidity: 1000 },
              { id: 'pool2', tokenA: 'TokenC', tokenB: 'TokenD', liquidity: 2000 },
            ],
          },
        };
        resolve(mockData);
      }, 1000); // Simulate async operation
    });
  }

  async swapTransaction(userPrivateKey: string, tokenBAddress: string, amountLamportsToSwap: number) {
    try {
      const heliusRpcUrl = this.configService.get<string>('blockchain.solana.rpcUrl');
      const raydiumSwap = new RaydiumSwap(heliusRpcUrl, userPrivateKey);
      const poolInfo = raydiumSwap.findPoolInfoForTokens(swapConfig.tokenAAddress, tokenBAddress);
      if (!poolInfo) {
        throw new Error('Pool info not found');
      }

      const transaction = await raydiumSwap.getSwapTransaction(
        tokenBAddress,
        amountLamportsToSwap,
        poolInfo,
        swapConfig.maxLamports,
        swapConfig.useVersionedTransaction,
        swapConfig.direction,
      );

      if (transaction instanceof VersionedTransaction) {
        return await raydiumSwap.sendVersionedTransaction(transaction, swapConfig.maxRetries);
      } else {
        return await raydiumSwap.sendLegacyTransaction(transaction, swapConfig.maxRetries);
      }
    } catch (error) {
      this.logger.error(`Error during swap transaction: ${error.message}`);
      throw error;
    }
  }
}
