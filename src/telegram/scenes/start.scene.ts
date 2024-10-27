import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { UserRepository } from '../../db/repository/user.repository';
import { TextService } from '../service/text/text.service';
import { UtilsService } from '../service/utils/utils.service';
import { I18nService } from 'nestjs-i18n';

@Wizard('start')
@Injectable()
export class StartWizard {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserRepository,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly utilsService: UtilsService,
  ) {
  }

  @WizardStep(0)
  async step0(ctx) {
    await this.ensureUserExists(ctx);
    await this.handleCommand(ctx);
  }

  private async handleCommand(ctx) {
    return this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));
  }

  //@ts-ignore
  @Action('plan')
  async plan(ctx) {
    await ctx.scene.enter('plan');
  }

  //@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }

  private async getStartMessage() {
    return this.i18n.translate('i18n.start_message');
  }

  private async getStartButtons() {
    return this.markupButtonsService.startMenuButtons();
  }

  private async startNewInstance(ctx) {
    await this.utilsService.startNewInstance(
      ctx,
      'start',
      this.getStartMessage.bind(this),
      this.getStartButtons.bind(this),
      this.textService.sendMessageWithButtons.bind(this.textService),
    );
  }

  private async ensureUserExists(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const chatId = this.utilsService.getChatId(ctx);
    let user = await this.userService.getUserByTelegramId(telegramId);

    if (!user) {
      this.logger.log(`User not found. Creating new user with Telegram ID: ${telegramId}`);
      try {
        this.logger.log(`Creating user with data: chatId=${chatId}, telegramId=${telegramId}, telegramFirstName=${ctx.from.first_name}, telegramUsername=${ctx.from.username}`);
        user = await this.userService.createUser({
          chatId,
          telegramId,
          telegramFirstName: ctx.from.first_name,
          telegramUsername: ctx.from.username,
        });
      } catch (error) {
        this.logger.error(`Failed to create user: ${error.message}`);
        if (error.code === 'P2002') { // Unique constraint failed
          this.logger.error(`This Telegram ID already exists in the database: ${telegramId}`);
          const existingUser = await this.userService.getUserByTelegramId(telegramId);
          this.logger.log(`Existing user details: ${JSON.stringify(existingUser)}`);
        }
        throw error;
      }
    } else {
      this.logger.log(`User already exists with Telegram ID: ${telegramId}`);
    }

    return user;
  }

}