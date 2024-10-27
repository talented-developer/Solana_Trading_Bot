import { Injectable, Logger } from '@nestjs/common';
import { InlineKeyboardButton, Message } from '@telegraf/types';
import { Markup, Telegraf } from 'telegraf';
import { InputFile } from 'telegraf/types';

@Injectable()
export class TextService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly bot: Telegraf,
  ) {
  }

  async sendForceReplyInputMessage(ctx, message: string): Promise<Message> {
    return await ctx.replyWithHTML(
      message, {
        reply_markup: Markup.forceReply().reply_markup,
      });
  }


  async sendMessageNoButtons(ctx, message: string): Promise<Message> {
    return ctx.replyWithHTML(
      message, {
        parse_mode: 'HTML',
        protect_content: true,

      },
    );
  }

  async sendErrorMessage(ctx, errorMessage) {
    await this.sendMessageNoButtons(ctx, errorMessage);
    ctx.scene.state = {};
  }

  async sendMessageWithButtons(ctx, message: string, buttons): Promise<Message> {
    return ctx.replyWithHTML(
      message, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        link_preview_options: { show_above_text: true, is_disabled: true },
        reply_markup: { inline_keyboard: buttons },
        protect_content: true,
      } as any);
  }

  async sendMessageWithButtonsWithPreview(ctx, message: string, buttons: InlineKeyboardButton[][]): Promise<Message> {
    return ctx.replyWithHTML(
      message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        link_preview_options: { show_above_text: true, is_disabled: false },
        reply_markup: { inline_keyboard: buttons },
      } as any);
  }


  async sendAlertMessageToChatIdsNoButtons(chatIds: bigint[], message: string, disableWebPagePreview?: boolean, linkPreviewOptions?) {
    for (const chatId of chatIds) {
      await this.bot.telegram.sendMessage(chatId.toString(), message, {
        parse_mode: 'HTML',
        disable_web_page_preview: disableWebPagePreview,
        link_preview_options: linkPreviewOptions,

      } as any);
    }
  }

  async sendAlertMessageToChatIdsWithButtons(chatIds: bigint[], message: string, disableWebPagePreview: boolean, linkPreviewOptions, buttons) {
    for (const chatId of chatIds) {
      await this.bot.telegram.sendMessage(chatId.toString(), message, {
        parse_mode: 'HTML',
        disable_web_page_preview: disableWebPagePreview,
        link_preview_options: linkPreviewOptions,
        reply_markup: { inline_keyboard: buttons },
        protect_content: true, // prevent to forward
      } as any);
    }
  }

  private async editMessage(ctx, chatId: number, messageId: number, message: string, buttons) {
    await ctx.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: buttons },
      },
    );
  }

  async updateMessage(ctx, message: string, buttons: any, chatId: number, messageId?: number): Promise<number> {
    try {
      await this.editMessage(ctx, chatId, messageId, message, buttons);
    } catch (error) {
      if (error.message.includes('message is not modified')) {
        this.logger.warn('Message not modified, but update attempt was made.');
      } else {
        this.logger.error('Error updating message:', error);
        return await this.handleUpdateError(ctx, error, chatId, messageId, message, buttons);
      }
    }
    return messageId;
  }


  private async handleUpdateError(ctx, error: Error, chatId: number, messageId: number, message: string, buttons: any): Promise<number> {
    if (error.message.includes('message can\'t be edited')) {
      await ctx.telegram.deleteMessage(chatId, messageId);
      const newMessage = await this.sendMessageWithButtons(ctx, message, buttons);
      return newMessage.message_id;
    }
    return messageId;
  }

  async sendMessageWithPhoto(ctx, chatId: bigint, photo: InputFile, buttons, caption: string) {
    await ctx.telegram.sendPhoto(chatId, photo, {
      caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }


  /**
   * Deletes multiple messages from the context.
   * @param ctx The context object containing methods to delete messages.
   * @param action
   * @param waitingMessage
   */
  async autoDeleteMessage<T>(
    ctx: any, action: () => Promise<T>, waitingMessage: string): Promise<T> {
    const temporaryWaitingMessage = await ctx.reply(waitingMessage);
    let result: T;
    try {
      result = await action();
    } finally {
      await ctx.deleteMessage(temporaryWaitingMessage.message_id);
    }
    return result;
  }
}