import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheStore } from '@nestjs/common/cache';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheStore) {
  }

  async set(key: string, value: any, ttl: number = 3600 * 3): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
    this.logger.debug(`Cache set for key: ${key}`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`Cache deleted for key: ${key}`);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== undefined;
  }


}