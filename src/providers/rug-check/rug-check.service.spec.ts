import { Test, TestingModule } from '@nestjs/testing';
import { RugCheckService } from './rug-check.service';
import { ConfigService } from '@nestjs/config';
import { PumpfunService } from '../pumpfun/pumpfun.service';

describe('RugCheckApiService', () => {
  let service: RugCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RugCheckService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'blockchain.rugCheck.baseUrl': 'https://api.rugcheck.xyz/v1/',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PumpfunService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RugCheckService>(RugCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isTokenRug', () => {
    it('should return true if the token is a rug pull', async () => {
      jest.spyOn(service as any, 'fetchTokenReport').mockResolvedValue({ rugged: true });

      const result = await service.isTokenRug('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm');
      expect(result).toBe(true);
    });

    it('should return false if the token is not a rug pull', async () => {
      jest.spyOn(service as any, 'fetchTokenReport').mockResolvedValue({ rugged: false });

      const result = await service.isTokenRug('NaN');
      expect(result).toBe(null);
    });
  });

  describe('fetchTokenReport', () => {
    it('should fetch and cache token report', async () => {
      const token = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
      const mockResponse = { rugged: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const report = await service['fetchTokenReport'](token);
      expect(report).toEqual(mockResponse);

      const cachedReport = await service['fetchTokenReport'](token);
      expect(cachedReport).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('getLiquidityAndLiquidityLock', () => {
    it('should return correct liquidity and lock values', async () => {
      const mockReport = {
        markets: [
          {
            lp: {
              lpLockedUSD: 500,
              lpLocked: 50,
              lpTotalSupply: 100,
            },
          },
        ],
      };

      jest.spyOn(service as any, 'fetchTokenReport').mockResolvedValue(mockReport);

      const result = await service.getLiquidityLock('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm');
      expect(result).toEqual({
        lpLockedUsd: 500,
        lpLockedPercentage: 50,
      });
    });
  });


  describe('getTop10HoldersPercentage', () => {
    it('should return correct top 10 ownership percentage', async () => {
      const mockReport = {
        token: { supply: 1000 },
        topHolders: [
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 100 },
          { amount: 50 },
          { amount: 50 },
          { amount: 50 }, // вне топ-10
        ],
      };

      jest.spyOn(service as any, 'fetchTokenReport').mockResolvedValue(mockReport);

      const result = await service.getTopHoldersPercentage('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm');
      expect(result).toBe(90);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.isTokenValid('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm');
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      const result = await service.isTokenValid('invalid-token');
      expect(result).toBe(false);
    });

    it('should return false if fetch fails', async () => {
      jest.spyOn(service['logger'], 'error').mockImplementation(() => {
      });
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch error'));

      const result = await service.isTokenValid('invalid-token');
      expect(result).toBe(false);
    });
  });

});