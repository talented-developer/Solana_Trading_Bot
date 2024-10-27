import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { AlertSettings, Settings, User } from '@prisma/client';
import { MarketCapRangeInterface, MarketCapRanges } from '@shared/iunterfaces/marketcap';

@Injectable()
export class SettingsRepository {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService) {
  }

  async getSettingsByTelegramId(telegramId: bigint): Promise<Settings | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: { Settings: true },
    }) as User & { Settings: Settings | null };

    return user?.Settings ?? null;
  }

  async updateMinBuy(telegramId: bigint, newMinBuy: number): Promise<Settings> {

    this.logger.debug(`Settings service updateMinBuy: ${telegramId} and ${newMinBuy}`);
    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    return this.prisma.settings.update({
      where: { userId },
      data: { minBuy: newMinBuy },
    });
  }

  async updateMevProtection(telegramId: bigint,mevProtection: boolean): Promise<Settings> {
    this.logger.debug(`Settings service updateMevProtectionOption: ${telegramId} and ${mevProtection}`);

    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    return this.prisma.settings.update({
      where: { userId },
      data: { mevProtection },
    });
  }

  async updateSlippage(telegramId: bigint, slippage: number): Promise<Settings> {
    this.logger.debug(`Settings service updateSlippage: ${telegramId} and ${slippage}`);

    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    return this.prisma.settings.update({
      where: { userId },
      data: { slippage },
    });
  }


  async updatePriorityFee(telegramId: bigint, priorityFee: number): Promise<Settings> {
    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    return this.prisma.settings.update({
      where: { userId },
      data: { priorityFee },
    });
  }

  async updateWithdrawWallet(telegramId: bigint, withdrawWallet: string): Promise<Settings> {
    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    return this.prisma.settings.update({
      where: { userId },
      data: { withdrawWallet },
    });
  }
  async getMarketCapRangesByTelegramId(telegramId: bigint): Promise<MarketCapRangeInterface[]> {
    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    const alertSettings = await this.prisma.alertSettings.findUnique({
      where: { userId },
    });

    if (!alertSettings) throw new Error('User not found or no alert settings configured');

    const ranges = alertSettings.marketCapRanges
      .split(',')
      .map(rangeId => this.getMarketCapRangeById(parseInt(rangeId.trim())));

    return ranges;
  }

  // Get a market cap range by ID
  private getMarketCapRangeById(id: number): MarketCapRangeInterface {
    const range = MarketCapRanges.find(range => range.id === id);

    if (!range) throw new Error(`Invalid market cap range ID: ${id}`);

    return range;
  }

  // Update market cap ranges by saving a string with IDs
  async updateMarketCapRanges(telegramId: bigint, newRangeIds: number[]): Promise<AlertSettings> {
    const userId = (await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    }))?.id;

    if (!userId) throw new Error('User not found');

    const rangeString = newRangeIds.join(',');

    return this.prisma.alertSettings.update({
      where: { userId },
      data: { marketCapRanges: rangeString },
    });
  }

  // Get human-readable market cap range names for UI
  async getMarketCapRangeNames(telegramId: bigint): Promise<string[]> {
    const ranges = await this.getMarketCapRangesByTelegramId(telegramId);

    return ranges.map(range => range.name);
  }
}