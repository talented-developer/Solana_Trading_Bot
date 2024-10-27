import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { UserRepository } from '../../db/repository/user.repository';
import { TelegramService } from '../service/utils/telegram.service';
import { UtilsService } from '../service/utils/utils.service';
import telegrafThrottler from 'telegraf-throttler';

@Injectable()
export class CreatePersonIfNotExistsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(this.constructor.name);
  private readonly CACHED_DB_PERSON_TELEGRAM_IDS: Set<number> = new Set<number>();
  private readonly utilsService: UtilsService;

  constructor(
    private readonly userService: UserRepository,
  ) {
  }

  async use(ctx, next: NextFunction) {
    const telegramId: bigint = this.utilsService.getTelegramId(ctx);
    const chatId: bigint = this.utilsService.getChatId(ctx);
    const referralLink = this.utilsService.extractReferralLink(ctx);

    if (!this.CACHED_DB_PERSON_TELEGRAM_IDS.has(Number(telegramId))) {
      const personExists = await this.userService.getUserByTelegramId(telegramId);
      if (!personExists) {
        this.logger.debug('User does not exist. Will create');
        let inviterId: number | null = null;
        if (referralLink) {
          const inviter = await this.userService.getByRefLink(referralLink);
          inviterId = inviter ? inviter.id : null;
        }
        await this.userService.createUser({
          telegramId,
          chatId,
          inviterId,
          telegramUsername: ctx.from?.username,
          telegramFirstName: ctx.from?.first_name,
        });
      }
      this.CACHED_DB_PERSON_TELEGRAM_IDS.add(Number(telegramId));
    }
    next();
  }
}

@Injectable()
export class CheckSubscriptionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CheckSubscriptionMiddleware.name);
  private readonly utilsService: UtilsService;

  constructor(private readonly botService: TelegramService) {
  }

  async use(ctx, next: NextFunction) {
    const telegramId = this.utilsService.getTelegramId(ctx);

    try {
      const isSubscribed = await this.botService.isUserSubscribed(telegramId);

      if (!isSubscribed) {
        this.logger.debug(`User is not subscribed ${telegramId}`);
        const subscribeButton = [
          [{
            text: 'Join our community',
            url: 'https://t.me/addlist/v_Xq-yXm0yFjY2Ji',
          }],
        ];

        await ctx.reply('You need to subscribe to our community to use this bot.', {
          reply_markup: { inline_keyboard: subscribeButton },
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.error('Error in CheckSubscriptionMiddleware', error);
      next(error);
    }
  }
}

@Injectable()
export class AllowOnlyPrivateChatsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AllowOnlyPrivateChatsMiddleware.name);

  async use(ctx, next: NextFunction) {
    if (ctx.chat?.type === 'private') {
      next();
    } else {
      this.logger.debug('Non-private chat attempted to access bot.');
    }
  }
}


/**
 * ThrottlerMiddleware to avoid spam messages
 * Uses telegraf-throttler to manage rate limits for incoming and outgoing messages.
 * @see https://github.com/KnightNiwrem/telegraf-throttler
 * Add to telegram.module.ts if needed
 */
@Injectable()
export class ThrottlerMiddleware implements NestMiddleware {
  private readonly throttler;
  private readonly logger = new Logger(ThrottlerMiddleware.name);

  constructor() {
    this.throttler = telegrafThrottler({
      group: {
        maxConcurrent: 1,
        minTime: 333,
        reservoir: 20,
        reservoirRefreshAmount: 20,
        reservoirRefreshInterval: 60000,
      },
      in: {
        highWater: 3,
        maxConcurrent: 1,
        minTime: 1000,
        strategy: 1,
      },
      out: {
        minTime: 1000,
        reservoir: 30,
        reservoirRefreshAmount: 30,
        reservoirRefreshInterval: 1000,
      },
      inKey: 'from',

    });
  }

  use(ctx, next: NextFunction) {
    return this.throttler(ctx, next)
      .catch(e => {
        this.logger.error(`Error processing update for chat: ${ctx.chat?.id}, user: ${ctx.from?.id}: ${e.message}`);
      });
  }
}


