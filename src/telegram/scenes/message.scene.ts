import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UserRepository } from '../../db/repository/user.repository';
import { TextService } from '../service/text/text.service';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { UtilsService } from '../service/utils/utils.service';

@Wizard('message')
export class MessageScene {
  private readonly logger = new Logger(this.constructor.name);

  private messageToSend: string;

  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserRepository,
    private readonly textService: TextService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly utilsService: UtilsService,
  ) {
  }

  @WizardStep(0)
  async requestMessage(ctx) {
    const userRole = await this.userService.getUserRole(ctx.from.id);
    if (userRole !== 'ADMIN') {
      ctx.scene.state = {};
      return;
    }

    if (await this.handleCommand(ctx)) {
      return;
    }

    const message = this.i18n.translate('i18n.input_messages.message_to_subs');
    await this.textService.sendForceReplyInputMessage(ctx, message);
    ctx.wizard.selectStep(1);
  }

  @WizardStep(1)
  async handleMessage(ctx) {
    if (await this.handleCommand(ctx)) {
      return;
    }

    const messageText = ctx.message?.text?.trim();
    this.messageToSend = messageText;
    const buttons = await this.markupButtonsService.messageMenuButtons();
    const formattedMessage = this.i18n.translate('i18n.post_message', { args: { messageText } });

    await this.textService.sendMessageWithButtons(ctx, formattedMessage, buttons);
  }

  private async handleCommand(ctx): Promise<boolean> {
    return await this.utilsService.checkAndHandleCommand(
      ctx,
      () => this.startNewInstance(ctx),
      () => this.close(ctx),
    );
  }

  private async startNewInstance(ctx) {
    const message = this.i18n.translate('i18n.input_messages.message_to_subs');
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
    this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
    ctx.wizard.selectStep(1);
  }

  private async sendMessageToSubscribers(messageText: string) {
    const telegramIds = await this.userService.getAllTelegramIds();
    await this.textService.sendAlertMessageToChatIdsNoButtons(telegramIds, messageText);
    this.logger.debug(`Message sent to subscribers: ${messageText}`);
  }

  @Action('send_button')
  async sendToSubscribers(ctx) {
    if (this.messageToSend) {
      await this.sendMessageToSubscribers(this.messageToSend);
      await ctx.reply(this.i18n.translate('i18n.success_messages.new_post_success'));
      this.messageToSend = '';
    }
  }

  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }
}