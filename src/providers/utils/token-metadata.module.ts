import { Module } from '@nestjs/common';
import { TokenMetadataService } from './fetch-token-metadata';

@Module({
  providers: [TokenMetadataService],
  exports: [TokenMetadataService],
})
export class TokenMetadataModule {
}