import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { SettingsRepository } from '../../db/repository/settings.repository';
import { UserRepository } from '../../db/repository/user.repository';
import { UtilsService } from '../service/utils/utils.service';
import { AlertSettings, Settings, User } from '@prisma/client';
import { TextService } from '../service/text/text.service';
import { SolanaService } from '../../providers/solana/solana.service';
import { MarketCapRangeNames, PriorityFeeOption } from '@shared/enums';
import { AlertSettingsRepository } from '../../db/repository/alert-settings.repository';
import { MarketCapRanges } from '@shared/iunterfaces/marketcap';

@Wizard('settings')
export class SettingsWizard {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserRepository,
    private readonly utilsService: UtilsService,
    private readonly solanaService: SolanaService,
    private readonly settingsService: SettingsRepository,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly alertSettingsService: AlertSettingsRepository,
  ) {
  }

  @WizardStep(0)
  async enterSettingsMenu(ctx) {
    const commandHandled = await this.handleCommand(ctx);
    if (commandHandled) {
      this.logger.debug('Command handled, exiting step 0');
      return;
    }
    this.logger.debug('Entering settings step 0');
    await this.startNewInstance(ctx);
  }

  @WizardStep(1)
  async enterInputTradeSettings(ctx) {
    this.logger.debug('Entering settings step 1');
    await this.handleInputSettings(ctx, 2, this.updateTradeSettingsAndRespond.bind(this));
  }

  @WizardStep(2)
  async enterAlertFilters(ctx) {
    this.logger.debug(`settings step 2`);
    await this.handleInputSettings(ctx, 3, this.updateAlertFiltersAndRespond.bind(this));
  }

  private async handleCommand(ctx): Promise<boolean> {
    this.logger.debug('Handling command');
    if (ctx.scene.state.token) {
      return false;
    }
    return await this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));

  }

  private async startNewInstance(ctx) {
    this.logger.debug('Starting new instance in step 0');
    const telegramId = this.utilsService.getTelegramId(ctx);
    const settingsMessage = await this.getSettingsMessage(telegramId);
    const settingsButtons = await this.markupButtonsService.settingsMainMenuButtons();
    const message = await this.textService.sendMessageWithButtons(ctx, settingsMessage, settingsButtons);
    this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
    ctx.wizard.selectStep(0);
    this.logger.debug(`Started new instance with message ID: ${message.message_id}`);
  }

//@ts-ignore
  @Action('trade_settings')
  async tradeSettings(ctx) {
    this.logger.debug(`trade settings clicked`);

    await this.updateSettings(ctx, 'trade');
  }

//@ts-ignore
  @Action('alert_settings')
  async callsSettings(ctx) {
    this.logger.debug(`alert  settings clicked`);
    await this.updateSettings(ctx, 'calls');
  }

//@ts-ignore
  @Action('back_to_main')
  async backToMainMenu(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const alertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];
    const mainMenuMessage = await this.generateMainMenuMessage(user, settings, alertSettings);
    const buttons = await this.markupButtonsService.settingsMainMenuButtons();
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await this.textService.updateMessage(ctx, mainMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id);
    } else if (ctx.scene.state.replyMessageId) {
      await this.textService.updateMessage(ctx, mainMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId);
    } else {
      const message = await this.textService.sendMessageWithButtons(ctx, mainMenuMessage, buttons);
      this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
    }
  }


  private async getSettingsMessage(telegramId: bigint) {
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const alertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];
    const tradeSettingsMessage = await this.getTradeSettingsMessage(user, settings);
    const alertSettingsMessage = await this.getAlertSettingsMessage(alertSettings);

    return `${tradeSettingsMessage}\n\n${alertSettingsMessage}`;
  }

  private async handleInputSettings(ctx, step: number, updateSettingsMethod: Function) {
    if (await this.handleCommand(ctx)) {
      return;
    }
    this.logger.debug(`handleInputSettings settings step ${step}`);
    const inputValue = ctx.message?.text?.trim();
    const telegramId = this.utilsService.getTelegramId(ctx);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);

    const validationResult = this.validateAndUpdateSetting(ctx, inputValue, settings);
    if (validationResult.errorMessage) {
      await this.textService.sendMessageNoButtons(ctx, validationResult.errorMessage);
      return;
    }
    await updateSettingsMethod(ctx, telegramId, validationResult.value);
    ctx.wizard.selectStep(step);
  }

  private async updateSettings(ctx, type: string) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const alertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];

    const settingsMenuMessage = type === 'trade'
      ? await this.getTradeSettingsMessage(user, settings)
      : await this.getAlertSettingsMessage(alertSettings);

    const marketCapRangeIds = alertSettings && alertSettings.marketCapRanges
      ? alertSettings.marketCapRanges.split(',').map(id => id.trim()).map(Number)
      : [];

    const buttons = type === 'trade'
      ? await this.markupButtonsService.tradeSettingsMenuButtons(settings)
      : await this.markupButtonsService.alertSettingsButtons(marketCapRangeIds);

    const replyMessageId = ctx.callbackQuery?.message?.message_id || ctx.scene.state.replyMessageId;
    if (replyMessageId) {
      await this.textService.updateMessage(ctx, settingsMenuMessage, buttons, ctx.chat.id, replyMessageId);
    } else {
      const message = await this.textService.sendMessageWithButtons(ctx, settingsMenuMessage, buttons);
      this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
    }
  }

  private async changeMevProtection(ctx, settingKey: string, step: number) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    let updatedSettings = await this.settingsService.getSettingsByTelegramId(telegramId);
    updatedSettings.mevProtection = updatedSettings.mevProtection ? false : true;
    const user = await this.userService.getUserByTelegramId(telegramId);
    const tradeSettingsMenuMessage = await this.getTradeSettingsMessage(user, updatedSettings);
    const buttons = await this.markupButtonsService.tradeSettingsMenuButtons(updatedSettings);
    this.utilsService.saveState(ctx, { settingKey });
    await this.updateTradeSettings(settingKey, telegramId, updatedSettings.mevProtection);

    await this.textService.updateMessage(ctx, tradeSettingsMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id);
  }

  private async changePriorityFee(ctx, priorityFeeOption: PriorityFeeOption) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const feeInSol = this.utilsService.getPriorityFeeDetails(priorityFeeOption);
    await this.settingsService.updatePriorityFee(telegramId, feeInSol);
    const updatedSettings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const tradeSettingsMenuMessage = await this.getTradeSettingsMessage(user, updatedSettings);
    const buttons = await this.markupButtonsService.tradeSettingsMenuButtons(updatedSettings);

    await this.textService.updateMessage(ctx, tradeSettingsMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id);
  }


  private async getTradeSettingsObject(user: User, settings: Settings) {
    const balance = await this.solanaService.getSolBalance(user.walletAddress);

    return {
      slippage: settings.slippage,
      minBuy: settings.minBuy,
      mevProtection: settings.mevProtection ? 'On' : 'Off',
      priorityFee: settings.priorityFee,
      withdrawWallet: settings.withdrawWallet || 'N/A',
      walletAddress: user.walletAddress,
      balance: balance || 'N/A',
    };
  }

  private async generateMainMenuMessage(user: User, settings: Settings, alertSettings: AlertSettings) {
    const tradeSettingsMenuMessage = await this.getTradeSettingsMessage(user, settings);
    const callsSettingsMenuMessage = await this.getAlertSettingsMessage(alertSettings);

    return `${tradeSettingsMenuMessage}\n\n${callsSettingsMenuMessage}`;
  }

  private async getTradeSettingsMessage(user: User, settings: Settings) {
    const tradeSettingsMessage = await this.getTradeSettingsObject(user, settings);
    return this.i18n.translate('i18n.settings_trade_menu', { args: tradeSettingsMessage });
  }


  private async askForValueForSettings(ctx, settingKey: string, promptMessage: string, step: number) {
    const message = this.i18n.translate('i18n.input_messages.prompt', { args: { promptMessage } });
    const replyMessage = await this.textService.sendForceReplyInputMessage(ctx, message);
    this.utilsService.saveState(ctx, { settingKey }, replyMessage);
    ctx.wizard.selectStep(step);
  }

  validateAndUpdateSetting(ctx, inputValue: string, settings: Settings): {
    value: number | string | null,
    errorMessage: string | null
  } {
    const { settingKey } = ctx.scene.state;
    const { value, errorMessage } = this.utilsService.validateOnSettingsKey(settingKey, inputValue, settings);

    if (errorMessage) {
      const translatedErrorMessage = String(this.i18n.translate(errorMessage));
      return { value: null, errorMessage: translatedErrorMessage };
    }

    return { value, errorMessage: null };
  }

  private async updateTradeSettingsAndRespond(ctx, telegramId: bigint, newValue: string | number | boolean) {
    const settingKey = ctx.scene.state.settingKey;
    const currentSettings = await this.settingsService.getSettingsByTelegramId(telegramId);
    if (currentSettings[settingKey] !== newValue) {
      await this.updateTradeSettings(settingKey, telegramId, newValue);
    }
    const settings = await this.settingsService.getSettingsByTelegramId(telegramId);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const tradeSettingsMenuMessage = await this.getTradeSettingsMessage(user, settings);
    const buttons = await this.markupButtonsService.tradeSettingsMenuButtons(settings);
    if (ctx.scene.state.replyMessageId) {
      await this.textService.updateMessage(ctx, tradeSettingsMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId);
    } else {
      const message = await this.textService.sendMessageWithButtons(ctx, tradeSettingsMenuMessage, buttons);
      this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
    }
  }


  private async updateAlertFiltersAndRespond(ctx, telegramId: bigint, newValue: string) {
    const settingKey = ctx.scene.state.settingKey;
    const user = await this.userService.getUserByTelegramId(telegramId);
    const alertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];

    if (alertSettings[settingKey] !== newValue) {
      await this.updateAlertSettings(settingKey, user.id, newValue);
    }
    const marketCapRangeIds = alertSettings[0].marketCapRanges
      ? alertSettings[0].marketCapRanges.split(',').map(id => id.trim()).map(Number)
      : [];
    const updatedAlertSettings = (await this.alertSettingsService.getAlertFilterByTelegramId(telegramId))[0];
    const alertFiltersMessage = await this.getAlertSettingsMessage(updatedAlertSettings);
    const buttons = await this.markupButtonsService.alertSettingsButtons(marketCapRangeIds);

    if (ctx.scene.state.replyMessageId) {
      await this.textService.updateMessage(ctx, alertFiltersMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId);
    } else {
      const message = await this.textService.sendMessageWithButtons(ctx, alertFiltersMessage, buttons);
      this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
    }
  }

  private async updateTradeSettings(settingKey: string, telegramId: bigint, newValue: string | number | boolean): Promise<boolean> {
    this.logger.debug(`updateTradeSettings Settings service update: ${settingKey} and ${telegramId} and ${newValue}`);
    switch (settingKey) {
      case 'minBuy':
        this.logger.debug(`Updating minBuy: ${newValue}`);
        await this.settingsService.updateMinBuy(telegramId, newValue as number);
        return true;
      case 'slippage':
        this.logger.debug(`Updating slippage: ${newValue}`);
        await this.settingsService.updateSlippage(telegramId, newValue as number);
        return true;
      case 'toggleMev':
        this.logger.debug(`Updating Mev Protection: ${newValue}`);
        await this.settingsService.updateMevProtection(telegramId, newValue as boolean);
        return true;
      case 'priorityFee':
        this.logger.debug(`Updating priorityFee: ${newValue}`);
        await this.settingsService.updatePriorityFee(telegramId, newValue as number);
        return true;
      case 'withdrawWallet':
        this.logger.debug(`Updating withdrawWallet: ${newValue}`);
        await this.settingsService.updateWithdrawWallet(telegramId, newValue as string);
        return true;
      default:
        this.logger.warn(`Unknown settingKey: ${settingKey}`);
        return false;
    }
  }


  private async updateAlertSettings(settingKey: string, id: number, newValue: string): Promise<boolean> {
    switch (settingKey) {
      case 'marketCapRange':
        await this.alertSettingsService.updateAlertFilters(newValue, id);
        return true;
      default:
        return false;
    }
  }

//@ts-ignore
  @Action('set_minBuy')
  async askForMinBuyAmount(ctx) {
    const promptMessage = this.i18n.translate('i18n.input_messages.minBuy');
    await this.askForValueForSettings(ctx, 'minBuy', promptMessage, 1);
  }

//@ts-ignore
  @Action('set_slippage')
  async askForSlippage(ctx) {
    const promptMessage = this.i18n.translate('i18n.input_messages.set_slippage');
    await this.askForValueForSettings(ctx, 'slippage', promptMessage, 1);
  }

//@ts-ignore
  @Action('change_mev_protection_setting')
  async changeMevProtectionSetting(ctx) {
    await this.changeMevProtection(ctx, 'toggleMev', 1);
  }

//@ts-ignore
  @Action('change_priority_fee_medium')
  async changePriorityFeeToMedium(ctx) {
    await this.changePriorityFee(ctx, PriorityFeeOption.Medium);
  }

//@ts-ignore
  @Action('change_priority_fee_high')
  async changePriorityFeeToHigh(ctx) {
    await this.changePriorityFee(ctx, PriorityFeeOption.High);
  }

//@ts-ignore
  @Action('change_priority_fee_ultimate')
  async changePriorityFeeToUltimate(ctx) {
    await this.changePriorityFee(ctx, PriorityFeeOption.Ultimate);
  }


//@ts-ignore
  @Action('change_priority_fee_custom')
  async setPriorityFeeCustom(ctx) {
    await this.askForPriorityFeeCustomValue(ctx);
  }

  private async askForPriorityFeeCustomValue(ctx) {
    const promptMessage = this.i18n.translate('i18n.input_messages.priorityFee');
    await this.askForValueForSettings(ctx, 'priorityFee', promptMessage, 1);
  }

//@ts-ignore
  @Action('set_withdraw_wallet')
  async askForWithdrawWallet(ctx) {
    const promptMessage = this.i18n.translate('i18n.input_messages.withdrawWallet');
    await this.askForValueForSettings(ctx, 'withdrawWallet', promptMessage, 1);
  }

//@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }

  @Action('set_marketCap_1k_100k')
  async setMarketCap100k(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const marketCapRangeId = MarketCapRanges.find(range => range.name === MarketCapRangeNames.BETWEEN_1K_100K)?.id;

    if (marketCapRangeId) {
      await this.alertSettingsService.updateAlertFilters(marketCapRangeId.toString(), user.id);
      await this.showUpdatedAlertSettings(ctx, telegramId);
    }
  }

  @Action('set_marketCap_100k_1m')
  async setMarketCap100kTo1m(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const marketCapRangeId = MarketCapRanges.find(range => range.name === MarketCapRangeNames.BETWEEN_100K_1M)?.id;

    if (marketCapRangeId) {
      await this.alertSettingsService.updateAlertFilters(marketCapRangeId.toString(), user.id);
      await this.showUpdatedAlertSettings(ctx, telegramId);
    }
  }

  @Action('set_marketCap_1m_10m')
  async setMarketCap1mTo10m(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const marketCapRangeId = MarketCapRanges.find(range => range.name === MarketCapRangeNames.BETWEEN_1M_10M)?.id;

    if (marketCapRangeId) {
      await this.alertSettingsService.updateAlertFilters(marketCapRangeId.toString(), user.id);
      await this.showUpdatedAlertSettings(ctx, telegramId);
    }
  }

  @Action('set_marketCap_10m_plus')
  async setMarketCap10mPlus(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const marketCapRangeId = MarketCapRanges.find(range => range.name === MarketCapRangeNames.MORE_THAN_10M)?.id;

    if (marketCapRangeId) {
      await this.alertSettingsService.updateAlertFilters(marketCapRangeId.toString(), user.id);
      await this.showUpdatedAlertSettings(ctx, telegramId);
    }
  }

  private async updateAlertSettingsMessage(marketCapRangeIds: number[]): Promise<string> {
    const marketCapRangeNames = marketCapRangeIds
      .map(id => {
        const range = MarketCapRanges.find(range => range.id === id);
        return range ? range.name : null;
      })
      .filter(name => name)
      .join(', ');

    return this.i18n.translate('i18n.settings_alerts_menu', { args: { marketCapRange: marketCapRangeNames } });
  }

  private async showUpdatedAlertSettings(ctx, telegramId) {
    const alertSettings = await this.alertSettingsService.getAlertFilterByTelegramId(telegramId);
    if (alertSettings.length === 0) {
      this.logger.warn(`No alert settings found for Telegram ID ${telegramId}`);
      const noSettingsMessage = await this.i18n.translate('i18n.no_alert_settings');
      await ctx.reply(noSettingsMessage);
      return;
    }

    const marketCapRangeIds = alertSettings[0].marketCapRanges
      ? alertSettings[0].marketCapRanges.split(',').map(id => id.trim()).map(Number)
      : [];

    const alertFiltersMessage = await this.updateAlertSettingsMessage(marketCapRangeIds);
    const buttons = await this.markupButtonsService.alertSettingsButtons(marketCapRangeIds);

    await this.textService.updateMessage(ctx, alertFiltersMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id);
  }

  private async getAlertSettingsMessage(alertSettings: AlertSettings): Promise<string> {
    const marketCapRangeIds = alertSettings.marketCapRanges ? alertSettings.marketCapRanges.split(',').map(id => id.trim()).map(Number) : [];

    const marketCapRangeNames = marketCapRangeIds
      .map(id => {
        const range = MarketCapRanges.find(range => range.id === id);
        return range ? range.name : null;
      })
      .filter(name => name)
      .join(', ');

    return this.i18n.translate('i18n.settings_alerts_menu', { args: { marketCapRange: marketCapRangeNames } });
  }
}