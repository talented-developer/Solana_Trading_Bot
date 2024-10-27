import { PnlService } from './pnl.service';
import { SwapDetailsDTO, SwapTokenDTO } from '@shared/types/swap-details';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as dotenv from 'dotenv';
import { AxiosInstance } from 'axios';
import { JupiterService } from '../jupiter/jupiter.service';
import { SwapService } from '../../telegram/service/swap/swap.service';
import { UtilsService } from '../../telegram/service/utils/utils.service';

dotenv.config({ path: '.env.development' });

const mockSolscanApiKey = process.env.SOLSCAN_API_KEY;
const solscanBaseUrl = 'https://pro-api.solscan.io/v2.0';

describe('PnlService', () => {
  let pnlService: PnlService;
  let mockJupiterService: jest.Mocked<JupiterService>;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockSwapService: jest.Mocked<SwapService>;
  let mockUtilsService: jest.Mocked<UtilsService>;

  beforeEach(() => {
    const mockConfigService: Partial<ConfigService> = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'blockchain.solscan.baseUrl':
            return solscanBaseUrl;
          case 'blockchain.solscan.apiKey_v2':
            return mockSolscanApiKey;
          default:
            return null;
        }
      }),
    };

    const mockAxiosInstance = {
      defaults: {
        baseURL: solscanBaseUrl,
        headers: {
          common: {
            'Authorization': `Bearer ${mockSolscanApiKey}`,
          },
        },
      },
    } as unknown as AxiosInstance;

    mockHttpService = {
      axiosRef: mockAxiosInstance,
    } as jest.Mocked<HttpService>;

    mockJupiterService = {
      getUSDSolPrice: jest.fn(),
      getSolPriceInUsdc: jest.fn().mockResolvedValue(100),
      createWallet: jest.fn(),
      sendSwapTransaction: jest.fn(),
    } as unknown as jest.Mocked<JupiterService>;

    mockSwapService = {} as jest.Mocked<SwapService>;

    mockUtilsService = {
      someUtilityFunction: jest.fn(),
      lamportsToSol: jest.fn((lamports) => lamports / Math.pow(10, 9)),  // Mock implementation of lamportsToSol
    } as unknown as jest.Mocked<UtilsService>;

    pnlService = new PnlService(
      mockConfigService as ConfigService,
      mockHttpService,
      mockSwapService,
      mockJupiterService,
      mockUtilsService,
    );
  });

  describe('getWinRate', () => {
    it('should calculate the correct win rate', () => {
      const swapHistory: SwapDetailsDTO[] = [
        {
          signatures: ['signature1'],
          signers: ['signer1'],
          buyToken: { symbol: 'SOL', amount: 5 } as SwapTokenDTO,
          sellToken: { symbol: 'USD', amount: 100 } as SwapTokenDTO,
          recipient: 'owner1',
        },
        {
          signatures: ['signature2'],
          signers: ['signer2'],
          buyToken: { symbol: 'USD', amount: 100 } as SwapTokenDTO,
          sellToken: { symbol: 'SOL', amount: 6 } as SwapTokenDTO,
          recipient: 'owner1',
        },
      ];

      const winRate = pnlService.getWinRate(swapHistory);
      expect(winRate).toBe(100);
    });

    it('should return 0% win rate when there are no winning trades', () => {
      const swapHistory: SwapDetailsDTO[] = [
        {
          signatures: ['signature1'],
          signers: ['signer1'],
          buyToken: { symbol: 'SOL', amount: 5 } as SwapTokenDTO,
          sellToken: { symbol: 'USD', amount: 100 } as SwapTokenDTO,
          recipient: 'owner1',
        },
        {
          signatures: ['signature2'],
          signers: ['signer2'],
          buyToken: { symbol: 'USD', amount: 100 } as SwapTokenDTO,
          sellToken: { symbol: 'SOL', amount: 4 } as SwapTokenDTO,
          recipient: 'owner1',
        },
      ];

      const winRate = pnlService.getWinRate(swapHistory);
      expect(winRate).toBe(0);
    });
  });
  describe('getPnLFromSwapHistory', () => {
    it('should calculate the correct PnL values', async () => {
      const swapHistory: SwapDetailsDTO[] = [
        {
          signatures: ['signature1'],
          signers: ['signer1'],
          buyToken: { symbol: 'USD', amount: 100, decimals: 2 } as SwapTokenDTO,
          sellToken: { symbol: 'SOL', amount: 6 * Math.pow(10, 9), decimals: 9 } as SwapTokenDTO, // 6 SOL куплено
          recipient: 'owner1',
        },
        {
          signatures: ['signature2'],
          signers: ['signer2'],
          buyToken: { symbol: 'SOL', amount: 5 * Math.pow(10, 9), decimals: 9 } as SwapTokenDTO, // 5 SOL продано
          sellToken: { symbol: 'USD', amount: 120 * Math.pow(10, 2), decimals: 2 } as SwapTokenDTO,
          recipient: 'owner1',
        },
      ];

      // Mock the `getUSDSolPrice` to return a fixed value
      mockJupiterService.getUSDSolPrice.mockResolvedValue(20);

      // Mock the `lamportsToSol` function correctly
      mockUtilsService.lamportsToSol.mockImplementation((lamports) => lamports / Math.pow(10, 9));

      const pnl = await pnlService.getPnLFromSwapHistory(swapHistory);

      // Update expectations based on the corrected implementation
      expect(pnl.investedSol).toBeCloseTo(5, 5);
      expect(pnl.profitSol).toBeCloseTo(1, 5);
      expect(pnl.investedUsd).toBeCloseTo(500, 2);
      expect(pnl.profitUsd).toBeCloseTo(100, 2);
      expect(pnl.profitPercentage).toBeCloseTo(20, 2);
      expect(pnl.gainLoss).toBeCloseTo(1.2, 2);
      expect(pnl.percentageGainLoss).toBeCloseTo(19.999999999999996, 2);
      expect(pnl.winRate).toBe(100);
    });
  });
});