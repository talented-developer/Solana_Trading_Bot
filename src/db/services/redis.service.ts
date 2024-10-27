import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigType } from '@nestjs/config';
import redisConfig from '../../../config/redis.config';
import { getDifferentialBreakdown } from '../../db/utils/differential.util';
import { TTL_TIMING } from '@shared/enums';


@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(this.constructor.name);


  constructor(
    @Inject(redisConfig.KEY)
    private readonly serviceConfig: ConfigType<typeof redisConfig>,
  ) {
    super({ ...serviceConfig });
    this.on('connect', this.handleConnect.bind(this));
    this.on('ready', this.handleReady.bind(this));
    this.on('error', this.handleError.bind(this));
    this.on('close', this.handleClose.bind(this));
    this.on('reconnecting', this.handleReconnecting.bind(this));
    this.on('end', this.handleEnd.bind(this));
    this.showConnectionStatus();
  }

  onModuleDestroy() {
    this.disconnect(false);
  }

  async setTokenCountWithTimestamp(tokenId: string): Promise<any> {
    const cacheKey = `token_count_${tokenId}`;
    let tokenDataStr = await this.get(cacheKey);
    let tokenData = tokenDataStr ? JSON.parse(tokenDataStr) : { count: 0, timestamp: null };
    tokenData.count += 1;
    tokenData.timestamp = new Date().getTime();

    await this.set(cacheKey, JSON.stringify(tokenData));

    return tokenData;
  }

  async getDiffBreakdown(tokenAddress: string, tokenDetails: any): Promise<any> {
    const prevTkDetailsStr = await this.get(tokenAddress);
    let prevTkDetails;

    try {
      prevTkDetails = prevTkDetailsStr ? JSON.parse(prevTkDetailsStr) : null;
    } catch (error) {
      this.logger.error('Error parsing previous token details', { error });
      return null;
    }

    if (!prevTkDetails) {
      return null;
    }

    const timestamp = new Date().getTime();
    tokenDetails = { timestamp, ...tokenDetails };

    return getDifferentialBreakdown(prevTkDetails, tokenDetails);
  }

  isTimestampValid(timestamp: number): boolean {
    const currentTime = new Date().getTime();
    return timestamp && (currentTime - timestamp < TTL_TIMING.TTL_SIX_HOURS ); // Ensure this is in milliseconds
  }

  private showConnectionStatus() {
    this.logger.log(`Redis connection status: ${this.status}`, { type: 'REDIS_STATUS' });
  }

  private handleConnect() {
    this.logger.log('Redis connecting...', { type: 'REDIS_CONNECTING' });
  }

  private handleReady() {
    this.logger.log('Redis connected!', { type: 'REDIS_CONNECTED' });
  }

  private handleClose() {
    this.logger.warn('Redis disconnected!', { type: 'REDIS_DISCONNECTED' });
  }

  private handleReconnecting() {
    this.logger.log('Redis reconnecting!', { type: 'REDIS_RECONNECTING' });
  }

  private handleEnd() {
    this.logger.warn('Redis connection ended!', { type: 'REDIS_CONN_ENDED' });
  }

  private handleError(err: any) {
    this.logger.error('Redis error occurred', { type: 'REDIS_ERROR', err });
  }
}

