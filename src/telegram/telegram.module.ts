import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Telegraf } from 'telegraf';
import { NotificationController } from '../controller/notification.controller';
import { AlertSettingsRepository } from '@db/repository/alert-settings.repository';
import { ClaimRepository } from '@db/repository/claim.repository';
import { PrismaModule } from '@db/services/prisma.module';
import { RedisModule } from '@db/services/redis.module';
import { ReferralRepository } from '@db/repository/referral.repository';
import { SettingsRepository } from '@db/repository/settings.repository';
import { SubscriptionRepository } from '@db/repository/subscription.repository';
import { TransactionRepository } from '@db/repository/transaction.repository';
import { UserRepository } from '@db/repository/user.repository';
import { AlchemyService } from '../providers/alchemy/alchemy.service';
import { BirdeyeService } from '../providers/birdeye/birdeye.service';
import { DexscreenerService } from '../providers/dexscreener/dexscreener.service';
import { JitoService } from '../providers/jito/jito.service';
import { JupiterService } from '../providers/jupiter/jupiter.service';
import { JupiterAPI } from '../providers/jupiter/jupiterAPI';
import { PnlService } from '../providers/pnl/pnl.service';
import { PumpfunService } from '../providers/pumpfun/pumpfun.service';
import { RaydiumService } from '../providers/raydium/raydium.service';
import { RugCheckService } from '../providers/rug-check/rug-check.service';
import { ShyftApiService } from '../providers/shyft/shyft-api.service';
import { SolanaModule } from '../providers/solana/solana.module';
import { SolanaService } from '../providers/solana/solana.service';
import { SolscanService } from '../providers/solscan/solscan.service';
import { TokenMetadataService } from '../providers/utils/fetch-token-metadata';
import { ScoreManager } from './managers/score-manager';
import { BroadcastScene } from './scenes/broadcast.scene';
import { MessageScene } from './scenes/message.scene';
import { HelpWizard } from './scenes/help.scene';
import { PlanWizard } from './scenes/plan.scene';
import { PortfolioScene } from './scenes/portfolioScene';
import { ReferralWizard } from './scenes/referral.scene';
import { SettingsWizard } from './scenes/settings.scene';
import { StartWizard } from './scenes/start.scene';
import { TradeWizard } from './scenes/trade.scene';
import { WalletWizard } from './scenes/wallet.scene';
import { AlertService } from './service/alert/alert.service';
import { MarkupButtonsService } from './service/buttons/button.service';
import { CommandsService } from './service/commands/commands.service';
import { GlobalFilterService } from './service/global-filter/global-filter.service';
import { NotificationService } from './service/notification/notification.service';
import { SwapService } from './service/swap/swap.service';
import { TextService } from './service/text/text.service';
import { TokenDetailsService } from './service/token-details/token-details.service';
import { CacheService } from './service/utils/cache.service';
import { ImageService } from './service/utils/image.service';
import { TelegramService } from './service/utils/telegram.service';
import { ThrottlerService } from './service/utils/throttler.service';
import { UtilsService } from './service/utils/utils.service';
import { WhaleDetectionService } from './service/whale-detection/whale-detection.service';
import { MarketCapService } from '../providers/jupiter/marketcap.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('telegram.bot.token'),
        middlewares: [session()],
      }),
    }),
    PrismaModule,
    RedisModule,
  ],
  providers: [
    {
      provide: Telegraf,
      useFactory: (configService: ConfigService) => {
        return new Telegraf(configService.get<string>('telegram.bot.token'));
      },
      inject: [ConfigService],
    },
    {
      provide: Connection,
      useFactory: (configService: ConfigService) => {
        const rpcUrl = configService.get<string>('blockchain.solana.rpcUrl');
        return new Connection(rpcUrl, { commitment: 'confirmed' });
      },
      inject: [ConfigService],
    },
    {
      provide: AlertService,
      useClass: AlertService,
    },
    {
      provide: CommandsService,
      useClass: CommandsService,
    },
    GlobalFilterService,
    BroadcastScene,
    MarketCapService,
    WhaleDetectionService,
    TradeWizard,
    PumpfunService,
    MarkupButtonsService,
    DexscreenerService,
    AlchemyService,
    CommandsService,
    TelegramService,
    BirdeyeService,
    ScoreManager,
    ShyftApiService,
    UtilsService,
    SolanaService,
    TextService,
    ClaimRepository,
    MessageScene,
    PortfolioScene,
    RugCheckService,
    JitoService,
    ImageService,
    JupiterAPI,
    JupiterService,
    SubscriptionRepository,
    UserRepository,
    ThrottlerService,
    SettingsRepository,
    AlertSettingsRepository,
    SolscanService,
    ReferralRepository,
    RaydiumService,
    TransactionRepository,
    ReferralWizard,
    PlanWizard,
    WalletWizard,
    SwapService,
    StartWizard,
    SettingsWizard,
    HelpWizard,
    PnlService,
    NotificationService,
    TokenDetailsService,
    CacheService,
    TokenMetadataService,
    SolanaModule,
  ],
  controllers: [NotificationController],
  exports: [TelegramService],
})
export class TelegramModule {
}
