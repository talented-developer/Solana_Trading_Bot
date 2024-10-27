import { AlertSettings } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AlertSettingsRepository {
  private readonly logger = new Logger(AlertSettingsRepository.name);

  constructor(
    private prisma: PrismaService,
  ) {
  }

  async updateAlertFilters(marketCapRangeIds: string, userId: number): Promise<void> {
    this.logger.debug(`updateAlertFilters called with marketCapRangeIds: ${marketCapRangeIds} and userId: ${userId}`);
    const currentSettings = await this.prisma.alertSettings.findUnique({
      where: { userId },
    }) as AlertSettings;

    const existingMarketCapRanges = currentSettings?.marketCapRanges ? currentSettings.marketCapRanges.split(',').map(id => id.trim()) : [];
    const marketCapRangeIdsArray = marketCapRangeIds.split(',').map(id => id.trim());
    const updatedMarketCapRanges = existingMarketCapRanges.filter(id => !marketCapRangeIdsArray.includes(id));
    for (const id of marketCapRangeIdsArray) {
      if (!existingMarketCapRanges.includes(id)) {
        updatedMarketCapRanges.push(id);
      }
    }

    await this.prisma.alertSettings.upsert({
      where: { userId },
      update: {
        marketCapRanges: updatedMarketCapRanges.join(','),
      },
      create: {
        marketCapRanges: updatedMarketCapRanges.join(','),
        userId,
      },
    });
  }

  async getAlertFilterByTelegramId(telegramId: bigint): Promise<AlertSettings[]> {
    this.logger.debug(`Fetching user with Telegram ID: ${telegramId}`);
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      select: { id: true },
    });

    return this.prisma.alertSettings.findMany({
      where: { userId: user.id },
    });
  }

}
