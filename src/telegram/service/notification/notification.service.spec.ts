import { NotificationService } from './notification.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AlertService } from '../alert/alert.service';
import { Telegraf } from 'telegraf';
import { GlobalFilterService } from '../global-filter/global-filter.service';
import { NotificationDto, NotificationType, TokenFilterType } from '@shared/types/notification-alert';
import { of } from 'rxjs';
import { AlertSettingsRepository } from '../../../db/repository/alert-settings.repository';
import { UserRepository } from '../../../db/repository/user.repository';
import { RedisService } from '../../../db/services/redis.service';
import * as mockTokenDetails from './mock/sample-token-details-for-notification.json';

const mockHttpService = {
  post: jest.fn().mockReturnValue(of({ data: 'Success' })),
};

const mockUserService = {
  findUserById: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
};

const mockRedisService = {
  setTokenDetails: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => key === 'telegram.bot.telegramApibaseUrl' ? 'https://api.telegram.org' : ''),
};

const mockI18nService = {
  translate: jest.fn().mockImplementation((key: string) => {
    if (key === 'i18n.call_type.raydium_token_launch') return Promise.resolve('Raydium Token Launch');
    if (key === 'i18n.call_type.large_buy') return Promise.resolve('Large Buy Notification');
    return Promise.resolve('Default Translation');
  }),
};

const mockAlertService = {
  processTokenAlert: jest.fn(),
};

const mockTelegraf = {
  context: {
    scene: {
      enter: jest.fn(),
    },
  },
};

const mockTokenFilterService = {
  validateToken: jest.fn().mockResolvedValue({
    isValid: true,
    whaleCount: ['0xabc123'],
    score: 200,
    tokenDetails: mockTokenDetails,
    scoreBreakdown: {},
    differentialBreakdown: { someKey: 'someValue' },
    tokenPnlAndWinrate: {},
  }),
};
describe('NotificationService', () => {
  let service: NotificationService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: AlertSettingsRepository, useValue: {} },
        { provide: Telegraf, useValue: mockTelegraf },
        { provide: GlobalFilterService, useValue: mockTokenFilterService },
        { provide: UserRepository, useValue: mockUserService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should handle a valid large buy notification', async () => {
    const notification: NotificationDto = {
      type: NotificationType.LARGE_BUY,
      tokenAddress: '0x1234567890abcdef',
    };
    const translationKey = 'i18n.call_type.large_buy';
    const expectedFilters = [
      TokenFilterType.MinLiquidityFilter,
      TokenFilterType.FreezeAuthority,
      // TokenFilterType.IsMutable,
      TokenFilterType.LiquidityLock,
      TokenFilterType.MintFilter,
      TokenFilterType.DevWalletValue,
      TokenFilterType.NumberOfHolders,
      TokenFilterType.ScoreFilter,
      // TokenFilterType.BuyVolumeCount,
      TokenFilterType.LiquidityRatio,
      // TokenFilterType.PriceChange,
      // TokenFilterType.PriceChangePositive,
      // TokenFilterType.VolumeBuySpike,
    ];
    mockTokenFilterService.validateToken.mockResolvedValue({
      isValid: true,
      whaleCount: ['0xabc123'],
      score: 200,
      tokenDetails: mockTokenDetails,
      scoreBreakdown: {},
      differentialBreakdown: { someKey: 'someValue' },
      tokenPnlAndWinrate: {},
      notificationTypeText: NotificationType.LARGE_BUY, // Make sure to include this in your mock
    });

    mockI18nService.translate.mockResolvedValue('Large Buy Notification'); // Mock translation return value

    await service.handleLargeBuyCall(notification);
    expect(mockAlertService.processTokenAlert).toHaveBeenCalledWith(
      notification,
      'Large Buy Notification', // Ensure this matches the mocked translation
      expectedFilters,
      ['0xabc123'],
      200,
      mockTokenDetails,
      {},
      { someKey: 'someValue' },
      {},
    );
  });
});