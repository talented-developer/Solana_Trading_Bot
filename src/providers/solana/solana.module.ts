import { Module } from '@nestjs/common';
import { BirdeyeService } from '../birdeye/birdeye.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RugCheckService } from '../rug-check/rug-check.service';
import { SolanaService } from './solana.service';
import { UtilsService } from '../../telegram/service/utils/utils.service';
import { TokenMetadataModule } from '../utils/token-metadata.module';
import { PumpfunService } from '../pumpfun/pumpfun.service';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    TokenMetadataModule,
  ],
  providers: [
    BirdeyeService,
    PumpfunService,
    ConfigService,
    UtilsService,
    SolanaService,
    RugCheckService,
  ],
})
export class SolanaModule {
}