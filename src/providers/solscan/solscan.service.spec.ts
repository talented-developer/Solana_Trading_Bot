import { Test, TestingModule } from '@nestjs/testing';
import { SolscanService } from './solscan.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import mockResponse from './mock/response-token-defi-activites.json';
import { Direction } from '@shared/types/swap-details';

describe('SolscanService', () => {
  let service: SolscanService;
  let httpService: HttpService;

  beforeAll(async () => {
    const httpServiceMock = {
      axiosRef: {
        defaults: {
          headers: {
            common: {},
          },
        },
      },
      get: jest.fn().mockReturnValue(of({ data: mockResponse })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolscanService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'blockchain.solscan.baseUrl') {
                return 'https://pro-api.solscan.io/v2.0';
              } else if (key === 'blockchain.solscan.apiKey_v2') {
                return 'mockApiKey';
              }
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<SolscanService>(SolscanService);
    httpService = module.get<HttpService>(HttpService);

    // Manually set the token to ensure headers are initialized properly in the mock
    httpService.axiosRef.defaults.headers.common['token'] = 'mockApiKey';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch defi activities', async () => {
    const result = await service.getDefiActivities({walletAddress: 'mockWalletAddress'});
    expect(result).toEqual(mockResponse);
  });

  it('should fetch swap details', async () => {
    const result = await service.getSwapDetails({walletAddress: 'mockWalletAddress'});

    // Ensure that the mockResponse structure is handled correctly
    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({
      sellToken: {
        tokenAddress: expect.any(String), // Adjust according to actual data
        amount: expect.any(Number),
        decimals: expect.any(Number),
        symbol: expect.any(String),
      },
      buyToken: {
        tokenAddress: expect.any(String), // Adjust according to actual data
        amount: expect.any(Number),
        decimals: expect.any(Number),
        symbol: expect.any(String),
      },
      timestamp: expect.any(Number),
      recipient: 'mockWalletAddress',
      direction: Direction.SELL,
      signatures: expect.any(Array),
      signers: expect.any(Array),
    });
  });
});