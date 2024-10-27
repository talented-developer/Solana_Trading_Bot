import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MarketCapService } from './marketcap.service';

//use this test locally with the helius rpc url
describe.skip('MarketCapService', () => {
  let service: MarketCapService;
  let httpService: HttpService;

  const heliusBaseUrl = '';

  beforeEach(async () => {
    const mockConfigService: Partial<ConfigService> = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'blockchain.solanaRpcUrl':
            return heliusBaseUrl;
          default:
            return null;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        MarketCapService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MarketCapService>(MarketCapService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct market cap', async () => {
    const tokenMintAddress = 'AQobUt5LDyQtLxCoDJ2SZjByxgz4fnE7Zt4i4grPpump';

    const marketCap = await service.getMarketCap(tokenMintAddress);
    const marketCapV2 = await service.getMarketCapV2(tokenMintAddress);

    console.log('Marketcap: ', marketCap);
    console.log('Marketcap V2: ', marketCapV2);

  });
});