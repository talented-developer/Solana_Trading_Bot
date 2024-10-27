import { Injectable, Logger } from '@nestjs/common';
import { Scenes, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  public readonly bot: Telegraf;
  private readonly logger = new Logger(this.constructor.name);
  private readonly contexts: Map<bigint, Scenes.WizardContext> = new Map();

  constructor(private configService: ConfigService) {
  }

  async getChatMemberStatus(chatId: number, userId: bigint): Promise<{ status: string }> {
    return await this.bot.telegram.getChatMember(chatId, Number(userId));
  }

  async isUserSubscribed(telegramId: bigint): Promise<boolean> {
    const subscriptionChatId = this.configService.get<number>('telegram.bot.subscriptionChatId');
    if (!subscriptionChatId) {
      this.logger.error('Subscription chat ID is not defined');
      throw new Error('Subscription chat ID is not defined');
    }

    if (this.configService.get<Set<number>>('telegram.bot.whitelistedTelegramIds').has(Number(telegramId))) {
      return true;
    }

    const chatInfo = await this.getChatMemberStatus(subscriptionChatId, telegramId);
    return ['member', 'administrator', 'creator'].includes(chatInfo.status);
  }

}
