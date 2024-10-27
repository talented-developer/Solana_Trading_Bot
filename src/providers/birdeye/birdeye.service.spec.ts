import { BirdeyeService } from './birdeye.service';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';

describe('BirdeyeService', () => {
  let service: BirdeyeService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirdeyeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'blockchain.birdeye.baseUrl': 'http://fakeurl.com',
                'blockchain.birdeye.apiKey': 'fakeApiKey',
              };
              return config[key];
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BirdeyeService>(BirdeyeService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchPriceHistory', () => {
    it('should fetch and return the price data', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            items: [{ unixTime: 1723899600, value: 0.0036061365089920527 }],
          },
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service['fetchPriceHistory']('someTokenAddress', 1620000000, 1620003600, '1m');
      expect(result).toEqual([0.0036061365089920527]);
    });

    it('should handle no price data', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            items: [],
          },
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service['fetchPriceHistory']('someTokenAddress', 1620000000, 1620003600, '1m');
      expect(result).toEqual([]);
    });

    it('should handle fetch error', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service['fetchPriceHistory']('someTokenAddress', 1620000000, 1620003600, '1m');
      expect(result).toEqual([]);
    });
  });

  describe('getMaxPrice', () => {
    it('should return max price for the given token age', async () => {
      jest.spyOn(service as any, 'fetchPriceHistory').mockResolvedValue([1.2, 1.5, 1.3]);

      const result = await service.getMaxPrice('someTokenAddress', 600, 0, 600); // Providing timeFromInSeconds and ageOfTokenInSeconds
      expect(result).toEqual(1.5);
    });

    it('should return 0 if no prices are available', async () => {
      jest.spyOn(service as any, 'fetchPriceHistory').mockResolvedValue([]);

      const result = await service.getMaxPrice('someTokenAddress', 600, 0, 600); // Providing timeFromInSeconds and ageOfTokenInSeconds
      expect(result).toEqual(0);
    });
  });
});
