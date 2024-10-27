import { Injectable, Logger } from '@nestjs/common';
import { Settings } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Message } from '@telegraf/types';
import { PriorityFeeOption, TipAccounts } from '@shared/enums';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { thresholdValues } from '@shared/types/threshold';


export interface ValidationResult<T> {
  value: T | null;
  errorMessage: string | null;
}

@Injectable()
export class UtilsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private configService: ConfigService, private readonly i18n: I18nService) {

  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleCommand(ctx, sceneName: string): Promise<boolean> {
    this.logCurrentScene(ctx);
    if (ctx.scene.current) {
      await ctx.scene.leave();
    }
    await ctx.scene.enter(sceneName);
    return true; // Return true to indicate the scene transition was attempted
  }

  logCurrentScene(ctx) {
    const currentScene = ctx.scene.current?.id || 'none';
    this.logger.debug(`Current scene: ${currentScene}`);
  }

  async enterScene(ctx, sceneName: string) {
    const currentScene = ctx.scene.current?.id || 'none';
    this.logger.debug(`Current scene: ${currentScene}`);
    if (currentScene !== sceneName) {
      this.logger.debug(`Entering scene: ${sceneName}`);
      await ctx.scene.enter(sceneName);
    } else {
      this.logger.debug(`Already in the '${sceneName}' scene`);
    }
  }

  async handleSceneCommand(ctx, command, startNewInstanceCallback, closeCallback) {
    this.logger.debug(`Command received: ${command}`);
    switch (command) {
      case 'start':
      case 'help':
      case 'plan':
      case 'referral':
      case 'wallet':
      case 'settings':
      case 'trade':
      case 'alert':
      case 'test':
      case 'portfolio':
      case 'broadcast':
      case 'message':
      case 'algoraCall':
        if (ctx.scene.current.id !== command) {
          await this.enterScene(ctx, command);
        } else {
          await startNewInstanceCallback(ctx);
        }
        break;
      case 'close':
        await closeCallback(ctx);
        break;
      default:
        this.logger.debug(`Ignoring unknown command: ${command}`);
        break;
    }
  }

  async checkAndHandleCommand(ctx, startNewInstanceCallback, closeCallback): Promise<boolean> {
    const command = this.extractCommand(ctx);
    if (command && [
      'start',
      'alert',
      'help',
      'plan',
      'referral',
      'wallet',
      'settings',
      'trade',
      'portfolio',
      'globalValidate',
      'algoraCall',
      'test',
      'broadcast',
      'message',
      'close']
      .includes(command)) {
      await this.handleSceneCommand(ctx, command, startNewInstanceCallback, closeCallback);
      return true;
    }
    return false;
  }

  async handleSceneCommandNoClose(ctx, command, startNewInstanceCallback) {
    this.logger.debug(`Command received: ${command}`);
    switch (command) {
      case 'start':
      case 'help':
      case 'alert':
      case 'plan':
      case 'referral':
      case 'wallet':
      case 'settings':
      case 'trade':
      case 'test':
      case 'portfolio':
      case 'globalValidate':
      case 'broadcast':
      case 'message':
      case 'algoraCall':
        if (ctx.scene.current.id !== command) {
          await this.enterScene(ctx, command);
        } else {
          await startNewInstanceCallback(ctx);
        }
        break;
      default:
        this.logger.debug(`Ignoring unknown command: ${command}`);
        break;
    }
  }

  async checkAndHandleCommandNoClose(ctx, startNewInstanceCallback): Promise<boolean> {
    const command = this.extractCommand(ctx);
    if (command && [
      'start',
      'help',
      'plan',
      'referral',
      'wallet',
      'settings',
      'trade',
      'portfolio',
      'globalValidate',
      'algoraCall',
      'test',
      'close']
      .includes(command)) {
      await this.handleSceneCommandNoClose(ctx, command, startNewInstanceCallback);
      return true;
    }
    return false;
  }

  async startNewInstance(
    ctx,
    sceneName: string,
    getMessageCallback,
    getButtonsCallback,
    sendMessageWithButtonsCallback,
    ensureUserExistsCallback = null,
  ) {
    if (ctx.session.startMessageSent && ctx.scene.current.id === sceneName) {
      this.logger.debug(`Resetting the ${sceneName} scene`);
      ctx.session.startMessageSent = false;
      await ctx.scene.leave();
      await ctx.scene.enter(sceneName);
    } else {
      if (ensureUserExistsCallback) {
        await ensureUserExistsCallback(ctx);
      }
      const message = await getMessageCallback();
      const buttons = await getButtonsCallback();
      await sendMessageWithButtonsCallback(ctx, message, buttons);
      ctx.session.startMessageSent = true;
      if (!ctx.scene.current || ctx.scene.current.id !== sceneName) {
        await ctx.scene.enter(sceneName);
      }
    }
  }


  extractCommand(ctx): string | null {
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
      return ctx.message.text.split(' ')[0].substring(1);
    }
    if (ctx.callbackQuery && ctx.callbackQuery.data) {
      return ctx.callbackQuery.data;
    }
    return null;
  }

  // Math

  getTokenAgeDDHH(tokenTimestampMs: number): string {
    const currentTimestampMs = Date.now();
    const tokenAgeInMs = currentTimestampMs - tokenTimestampMs;

    const msInDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const msInHour = 60 * 60 * 1000; // milliseconds in an hour

    const days = Math.floor(tokenAgeInMs / msInDay);
    const remainingMs = tokenAgeInMs % msInDay;
    const hours = Math.floor(remainingMs / msInHour);

    return `${days} days ${hours} hr(s)`;
  }

  formatPercentage(value: number) {
    if (value % 1 === 0) {
      return value;
    } else {
      return value.toFixed(2);
    }
  }

  formatNumberToUSA = (number): string => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  solToLamports(sol: number): number {
    return sol * LAMPORTS_PER_SOL;
  }

  usdcToLamports(usdc: number): number {
    return Math.round(usdc * 1000000);
  }

  lamportsToUsdc(lamports: number): number {
    return lamports / 1000000;
  }

  formatNumberToSubscript(value: number, decimals: number = 6): string {
    const truncatedValue = value.toFixed(decimals);
    const [integerPart, fractionalPart = ''] = truncatedValue.split('.');
    const leadingZerosMatch = fractionalPart.match(/^0+/);
    const leadingZeros = leadingZerosMatch ? leadingZerosMatch[0].length : 0;
    const nonZeroFractionalPart = fractionalPart.replace(/^0+/, '');
    const subscriptZerosCount = Math.min(leadingZeros);
    const symbol = this.getSubscriptChar(subscriptZerosCount);
    const formattedFractionalPart = `${symbol}${nonZeroFractionalPart}`;

    return `${integerPart}${formattedFractionalPart ? ',' : ''}${formattedFractionalPart}`;
  }

  private getSubscriptChar(digit: number): string {
    const subscriptMap = {
      '0': '',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
    };

    return subscriptMap[digit.toString()] || '';
  }

  formatLargeNumber(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    } else {
      return value.toFixed(2);
    }
  }


  formatUsd(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  calculateDeveloperFee(amountLamports: number): number {
    return Math.floor(amountLamports * thresholdValues.algoraSwapFees);
  }

  async getAmountLamportsForReferral(inviterId: number | null, amountLamports: number): Promise<number> {
    return inviterId
      ? Math.floor(amountLamports * thresholdValues.referralFees)
      : 0;
  }

// TELEGRAM API TOOLS
  hasContentChanged(currentText: string, currentButtons: any[], newText: string, newButtons: any[]): boolean {
    const normalizeText = (text: string) => text.replace(/\s/g, '');
    const currentButtonsJson = JSON.stringify(currentButtons);
    const newButtonsJson = JSON.stringify(newButtons);

    return normalizeText(currentText) !== normalizeText(newText) || currentButtonsJson !== newButtonsJson;
  }

  getTelegramId(ctx): bigint {
    return ctx.from.id;
  }

  getChatId(ctx): bigint {
    return ctx.chat.id;
  }

  getTextFromInput(ctx): string {
    return ctx.message?.text?.trim();
  }

  /**
   * Extracts the referral link from the message context, if present.
   * @param ctx The message context.
   * @returns The extracted referral link if found, otherwise null.
   */
  extractReferralLink(ctx): string | null {
    const startCommandArgument = ctx.message?.text?.split(' ')[1];
    if (startCommandArgument && startCommandArgument.startsWith('ref_')) {
      return startCommandArgument.substring(4);
    }
    return null;
  }

  /**
   * Formats a template string or object by replacing placeholders with values from details.
   * @param template The template string or object to format.
   * @param details The details object containing values for placeholders.
   * @returns The formatted string.
   */
  formatText(template: string | Record<string, string>, details: Record<string, any>): string {
    if (typeof template === 'string') {
      return template.replace(/\{(\w+)\}/g, (_, key) => {
        return details[key] !== undefined && details[key] !== null ? details[key].toString() : 'NaN';
      });
    } else if (typeof template === 'object') {
      return Object.entries(template)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return value.replace(/\{(\w+)\}/g, (_, key) => {
              return details[key] !== undefined && details[key] !== null ? details[key].toString() : 'NaN';
            });
          }
          return '';
        })
        .filter(line => line.trim() !== '')
        .join('\n');
    }
    return '';
  }

// VALIDATORS
  /**
   * Validates that the input string represents a positive number.
   * @returns An object with parsed value if valid, otherwise null with an error message.
   * @param inputValue
   */
  validatePositiveNumber(inputValue: string): ValidationResult<number> {
    const parsedValue = parseFloat(inputValue.trim().replace(',', '.'));
    return isNaN(parsedValue) || parsedValue <= 0
      ? { value: null, errorMessage: 'i18n.error_messages.not_positive_input_error' }
      : { value: parsedValue, errorMessage: null };
  }

  /**
   * Validates that the input string represents a number within the specified range.
   * @param input The input string to validate.
   * @param min The minimum allowed value.
   * @param max The maximum allowed value.
   * @returns An object with parsed value if valid, otherwise null with an error message.
   */
  validateNumberInRange(input: string, min: number, max: number): ValidationResult<number> {
    const parsedValue = parseFloat(input.trim());
    return isNaN(parsedValue) || parsedValue < min || parsedValue > max
      ? { value: null, errorMessage: 'i18n.error_messages.solana_wallet_input_error' }
      : { value: parsedValue, errorMessage: null };
  }

  /**
   * Validates that the input string represents a valid Solana wallet address.
   * @param input The input string to validate.
   * @returns An object with the validated wallet address if valid, otherwise null with an error message.
   */
  validateSolanaWalletAddress(input: string): ValidationResult<string> {
    const addressRegex = new RegExp(this.configService.get<string>('blockchain.solana.addressRegex'));
    const trimmedInput = input.trim();
    return addressRegex.test(trimmedInput)
      ? { value: trimmedInput, errorMessage: null }
      : { value: null, errorMessage: 'i18n.error_messages.solana_wallet_input_error' };
  }

  /**
   * Checks if the new value is the same as the current value.
   * @param newValue The new value to compare.
   * @param currentValue The current value to compare against.
   * @returns An object with a boolean indicating if the values are the same, and an error message if they are.
   */

  validateSameValue<T>(newValue: T, currentValue: T): ValidationResult<boolean> {
    return newValue === currentValue
      ? { value: true, errorMessage: 'i18n.error_messages.same_input_error' }
      : { value: false, errorMessage: null };
  }

  validateDefaultBuy(settingKey: string, parsedValue: number): ValidationResult<number> {
    return { value: parsedValue, errorMessage: null };
  }

  validateWalletSetting(inputValue: string, settings: Settings): ValidationResult<string> {
    const walletValidationResult = this.validateSolanaWalletAddress(inputValue);
    if (walletValidationResult.errorMessage) {
      return { value: null, errorMessage: this.i18n.translate(walletValidationResult.errorMessage) };
    }

    const sameValueResult = this.validateSameValue(walletValidationResult.value, settings.withdrawWallet);
    if (sameValueResult.errorMessage) {
      return { value: null, errorMessage: this.i18n.translate(sameValueResult.errorMessage) };
    }

    return { value: walletValidationResult.value, errorMessage: null };
  }

  validateNumericSetting(settingKey: string, inputValue: string, settings: Settings): ValidationResult<number> {
    const positiveNumberResult = this.validatePositiveNumber(inputValue);
    if (positiveNumberResult.errorMessage) {
      return positiveNumberResult;
    }

    const parsedValue = positiveNumberResult.value;
    const rangeValidationResult = this.validateDefaultBuy(settingKey, parsedValue);
    if (rangeValidationResult.errorMessage) {
      return rangeValidationResult;
    }

    const sameValueResponse = this.validateSameValue(parsedValue, settings[settingKey]);
    if (sameValueResponse.errorMessage) {
      return { value: null, errorMessage: this.i18n.translate(sameValueResponse.errorMessage) };
    }

    return { value: parsedValue, errorMessage: null };
  }

  validateSlippageSetting(inputValue: string, settings: Settings): ValidationResult<number> {
    const numericValueResult = this.validateNumberInRange(inputValue, 0, 100);
    if (numericValueResult.errorMessage) {
      return {
        value: null,
        errorMessage: this.i18n.translate(numericValueResult.errorMessage),
      };
    }

    const sameValueResult = this.validateSameValue(numericValueResult.value, settings.slippage);
    if (sameValueResult.errorMessage) {
      return {
        value: null,
        errorMessage: this.i18n.translate(sameValueResult.errorMessage),
      };
    }
    return {
      value: numericValueResult.value,
      errorMessage: null,
    };
  }

  validateOnSettingsKey(settingKey: string, inputValue: string, settings: Settings): ValidationResult<number | string> {
    switch (settingKey) {
      case 'minBuy':
      case 'toggleMev':
      case 'priorityFee':
        return this.validateNumericSetting(settingKey, inputValue, settings);
      case 'slippage':
        return this.validateSlippageSetting(inputValue, settings);
      case 'withdrawWallet':
        return this.validateWalletSetting(inputValue, settings);
      default:
        return { value: null, errorMessage: this.i18n.translate('i18n.error_messages.up_to_date_error') };
    }
  }

  saveState(ctx: any, state: Record<string, any>, replyMessage?: Message) {
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        ctx.scene.state[key] = state[key];
      }
    }
   
    if (replyMessage) {
      ctx.scene.state.replyMessageId = replyMessage.message_id;
    }
  }

  getPriorityFeeDetails(priorityFeeOption: PriorityFeeOption) {
    return this.priorityFeeMap[priorityFeeOption]?.sol || 0;
  }

  priorityFeeMap: { [key in PriorityFeeOption]?: { sol: number } } = {
    [PriorityFeeOption.Medium]: { sol: 0.0015 },
    [PriorityFeeOption.High]: { sol: 0.0075 },
    [PriorityFeeOption.Ultimate]: { sol: 0.02 },
  };

  mapNumberToPriorityFeeOption(priorityFee: number): PriorityFeeOption {
    if (priorityFee === 0.0015) return PriorityFeeOption.Medium;
    if (priorityFee === 0.0075) return PriorityFeeOption.High;
    if (priorityFee === 0.02) return PriorityFeeOption.Ultimate;
    if (priorityFee >= 0) return PriorityFeeOption.Custom;

    throw new Error(`Invalid priority fee value: ${priorityFee}`);
  }

  getRemainingSubscriptionTime(expirationDate: Date, now: Date = new Date()): string {
    const diff = now.getTime() - expirationDate.getTime();
    if (diff <= 0) {
      return this.i18n.translate('i18n.plan_remaining_time.less_than_hour');
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
      return this.i18n.translate('i18n.plan_remaining_time.days_hours', { args: { days, hours } });
    } else if (hours > 0) {
      return this.i18n.translate('i18n.plan_remaining_time.hours', { args: { hours } });
    } else {
      return this.i18n.translate('i18n.plan_remaining_time.less_than_hour');
    }
  }

  getRandomTipAccount(): string {
    const accounts = Object.values(TipAccounts);
    const randomIndex = Math.floor(Math.random() * accounts.length);
    return accounts[randomIndex];
  }
}
