import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import configuration, { configurationValidationSchema } from '../config/configuration';
import { SolanaModule } from './providers/solana/solana.module';
import { PrismaModule } from './db/services/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './db/services/redis.module'; //TODO:  dupe of the code in telegram module.

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      cache: true,
      isGlobal: true,
      load: [configuration],
      validationSchema: configurationValidationSchema,
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 mins
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('telegram.i18n.fallbackLanguage'),
        loaderOptions: { path: configService.get('telegram.i18n.i18nFolderPath') },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    SolanaModule,
    PrismaModule,
    TelegramModule,
    HttpModule,
    RedisModule,  //TODO:  dupe of the code in telegram module.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    const logger = new Logger(AppModule.name);
    logger.log(`Node environment: ${process.env.NODE_ENV}`);
  }
}