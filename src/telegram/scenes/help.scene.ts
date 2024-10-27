import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { TextService } from '../service/text/text.service';
import { UtilsService } from '../service/utils/utils.service';

@Injectable()
@Wizard('help')
export class HelpWizard {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly utilsService: UtilsService,
  ) {
  }

  private async getCommandDescriptions() {
    return {
      helpDescription: await this.i18n.translate('i18n.commands_descriptions.help'),
      portfolioDescription: await this.i18n.translate('i18n.commands_descriptions.portfolio'),
      subscriptionDescription: await this.i18n.translate('i18n.commands_descriptions.plan'),
      referralDescription: await this.i18n.translate('i18n.commands_descriptions.referral'),
      settingsDescription: await this.i18n.translate('i18n.commands_descriptions.settings'),
      tradeDescription: await this.i18n.translate('i18n.commands_descriptions.trade'),
      walletDescription: await this.i18n.translate('i18n.commands_descriptions.wallet'),
    };
  }

  @WizardStep(0)
  async step0(ctx) {
    await this.handleCommand(ctx);
  }

  private async handleCommand(ctx) {
    return this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));
  }

  private async startNewInstance(ctx) {
    await this.utilsService.startNewInstance(
      ctx,
      'help',
      this.getHelpMessage.bind(this),
      this.getHelpButtons.bind(this),
      this.textService.sendMessageWithButtons.bind(this.textService),
    );
  }

  private async getHelpMessage() {
    const descriptions = await this.getCommandDescriptions();
    return this.i18n.translate('i18n.help_menu_message', { args: descriptions });
  }

  private async getHelpButtons() {
    return await this.markupButtonsService.helpMenuButtons();
  }

//@ts-ignore
  @Action('faq')
  async faq(ctx) {
    const faq = await this.i18n.translate('i18n.faq') as {
      title: string;
      questions: { question: string; answer: string }[]
    };

    if (!faq || !faq.title || !Array.isArray(faq.questions)) {
      await this.textService.sendMessageNoButtons(ctx, await this.i18n.translate('i18n.error_messages.update_failed'));
      return;
    }
    const escapeHtml = (text: string) => text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const message = `<b>${escapeHtml(faq.title)}</b>\n\n${faq.questions.map(q => `<b>${escapeHtml(q.question)}</b>\n${escapeHtml(q.answer)}`).join('\n\n')}`;
    const buttons = await this.markupButtonsService.faqMenuButtons();
    const chatId = ctx.chat?.id;
    const messageId = ctx.callbackQuery?.message?.message_id;
    if (!chatId || !messageId) {
      return;
    }
    await this.textService.updateMessage(ctx, message, buttons, chatId, messageId);
  }

//@ts-ignore
  @Action('back_to_help')
  async backToHelp(ctx) {
    this.logger.debug('Back to help action');
    const descriptions = await this.getCommandDescriptions();
    const message = await this.i18n.translate('i18n.help_menu_message', { args: descriptions });
    const buttons = await this.markupButtonsService.helpMenuButtons();
    const chatId = ctx.chat?.id;
    const messageId = ctx.callbackQuery?.message?.message_id;
    if (!messageId) {
      return;
    }
    await this.textService.updateMessage(ctx, message, buttons, chatId, messageId);
    ctx.wizard.selectStep(0);
  }

//@ts-ignore
  @Action('close')
  async close(ctx) {
    this.logger.debug('Closing scene');
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }
}