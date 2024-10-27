import { PublicKey } from '@solana/web3.js';
import { SwapService } from './swap.service';
import { ConfigService } from '@nestjs/config';
import { SolanaService } from '../../../providers/solana/solana.service';
import { JupiterService } from '../../../providers/jupiter/jupiter.service';
import { UtilsService } from '../utils/utils.service';
import { UserRepository } from '../../../db/repository/user.repository';
import { TextService } from '../text/text.service';
import { I18nService } from 'nestjs-i18n';

describe('SwapService', () => {
  let swapService: SwapService;
  let solanaService: jest.Mocked<SolanaService>;
  let jupiterService: jest.Mocked<JupiterService>;
  let utilsService: jest.Mocked<UtilsService>;
  let userService: jest.Mocked<UserRepository>;
  let textService: jest.Mocked<TextService>;
  let i18nService: jest.Mocked<I18nService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    solanaService = {} as jest.Mocked<SolanaService>;
    jupiterService = {} as jest.Mocked<JupiterService>;
    utilsService = {} as jest.Mocked<UtilsService>;
    userService = {} as jest.Mocked<UserRepository>;
    textService = {} as jest.Mocked<TextService>;
    i18nService = {} as jest.Mocked<I18nService>;
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'blockchain.solana.rpcUrl') {
          return 'https://mock-rpc-url.com';  // Ensure a valid URL is returned
        }
        return 'mock-value';
      }),
    } as unknown as jest.Mocked<ConfigService>;

    swapService = new SwapService(
      configService,
      solanaService,
      textService,
      i18nService,
      jupiterService,
      utilsService,
      userService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should paginate signatures until the specified time', async () => {
    const address = new PublicKey('11111111111111111111111111111111');  // Use a valid base58 string
    const until = 1723050000; // Example Unix timestamp
    const signatures = [
      { blockTime: 1723049999, signature: 'sig1' },
      { blockTime: 1723050000, signature: 'sig2' },
    ];

    jest.spyOn(swapService as any, 'getSignaturesForAddress').mockResolvedValue(signatures as any);

    const result = await swapService.paginateSignaturesTillTime(address, until);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((sig) => sig.blockTime <= until)).toBe(true);
  });

  it('should return an empty array if no signatures are found', async () => {
    const address = new PublicKey('11111111111111111111111111111111');  // Use a valid base58 string

    jest.spyOn(swapService as any, 'getSignaturesForAddress').mockResolvedValue([]);

    const result = await swapService.paginateSignaturesTillTime(address, 1723050000);

    expect(result).toEqual([]);
  });
});