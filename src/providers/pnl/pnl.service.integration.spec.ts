import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicKey } from '@solana/web3.js';
import { SwapService } from '../../telegram/service/swap/swap.service';
import { JupiterService } from '../jupiter/jupiter.service';
import { JupiterAPI } from '../jupiter/jupiterAPI';
import { SolanaService } from '../solana/solana.service';
import { SolscanService } from '../solscan/solscan.service';
import { PnlService } from './pnl.service';
import * as dotenv from 'dotenv';
import { UtilsService } from '../../telegram/service/utils/utils.service';
import { I18nService } from 'nestjs-i18n';

dotenv.config({ path: '.env.development' });

describe('PnlService', () => { //TODO: uncomment on production
// describe('PnlService', () => { //TODO: uncomment on development
  let service: PnlService;
  let jupservice: JupiterService;

  beforeEach(async () => {
    const mockSwapService = {};

    const mockSolanaService = {
      getDeveloperFeePubkey: jest.fn(() => new PublicKey('7GzsMaKx7UfgFBWMQGWK1fBMxESnjyUrUzTHtVtcMAuH')),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        JupiterAPI,
        PnlService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'blockchain.solana.rpcUrl': 'https://mainnet.helius-rpc.com/?api-key=f24bda08-13c8-4e5a-90cf-d84d58cd7ece',
                'blockchain.solana.solanaInvoiceWalletAddress': 'FakeInvoiceWalletAddress',
                'blockchain.solana.feeAccountAddress': 'FakeFeeAccountAddress',
                'blockchain.solscan.baseUrl': 'https://pro-api.solscan.io/v2.0',
                'blockchain.solscan.apiKey_v2': process.env.SOLSCAN_API_KEY_v2,
                'blockchain.solana.usdcAddressSolanaChain': 'FakeUsdcAddress',
                'blockchain.jupiter.priceUrl': 'https://price.jup.ag/v6',
              };
              return config[key];
            }),
          },
        },
        SolscanService,
        { provide: SwapService, useValue: mockSwapService },
        { provide: SolanaService, useValue: mockSolanaService },
        JupiterService,
        { provide: UtilsService, useClass: UtilsService },
        {
          provide: I18nService,
          useValue: {
            // Add mock implementation or configuration for I18nService if needed
            translate: jest.fn(),
          },
        },
        {
          provide: 'I18nOptions',
          useValue: {
            // Provide mock options for I18nOptions
            fallbackLang: 'en',
            // Add other required I18nOptions properties
          },
        },
      ],
    }).compile();

    service = module.get<PnlService>(PnlService);
    jupservice = module.get<JupiterService>(JupiterService);
  });

  it('should give sol price', async () => {
    expect(jupservice).toBeDefined();
    const solPrice = await jupservice.getSolPriceInUsdc();
    console.log(solPrice);
    expect(solPrice).toBeDefined();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    // const tokenAddress = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    // const walletAddress = '7rhxnLV8C77o6d8oz26AgK8x8m5ePsdeRawjqvojbjnQ';
    const tokenAddress = 'FoPD9rwnha98qMeh7MeXV3q6DR7QeUtkaQp6AFNpump';

    const pricePnlSeries = await service.getSeriesPricePnLSummaryForWalletSolScan({walletAddress: tokenAddress, tokenAddress});

    expect(pricePnlSeries).toBeDefined

    console.log(JSON.stringify(pricePnlSeries, null, 2));
  });
});