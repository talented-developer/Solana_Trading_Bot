import { InlineKeyboardButton } from '@telegraf/types';
import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Settings } from '@prisma/client';

@Injectable()
export class MarkupButtonsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly i18n: I18nService,
  ) {
  }

  /**   Alert to trade button   */
  async tradeButton(token_address: string, token_name: string): Promise<InlineKeyboardButton[][]> {
    const text = await this.i18n.translate('i18n.buttons.trade', { args: { token_name } });
    return [[
      { text: text, callback_data: `trade_${token_address}` },
    ]];
  }


  /** Start Menu Buttons   */
  async startMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [{
        text: await this.i18n.translate('i18n.buttons.join_community'),
        url: 'https://t.me/algorachat',
      }],
      [{ text: await this.i18n.translate('i18n.buttons.plan'), callback_data: 'plan' }],
      [{ text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** Referral Menu Buttons   */
  async referralMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [{ text: await this.i18n.translate('i18n.buttons.claim_rewards_sol'), callback_data: 'claim_rewards_sol' },
        { text: await this.i18n.translate('i18n.buttons.claim_rewards_usdc'), callback_data: 'claim_rewards_usdc' }],
      [{ text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }


  /** Settings Menu Buttons   */
  async settingsMainMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [{ text: await this.i18n.translate('i18n.buttons.trade_settings'), callback_data: 'trade_settings' }],
      [{ text: await this.i18n.translate('i18n.buttons.alert_settings'), callback_data: 'alert_settings' }],
      [{ text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** Broadcast Settings Menu Buttons   */
  async broadcastMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [
        { text: `${this.i18n.translate('i18n.buttons.send_button')}`, callback_data: 'send_button' },
      ],
      [
        { text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' },
      ],
    ];
  }

  /** Send message to Subs Buttons   */
  async messageMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [
        { text: `${this.i18n.translate('i18n.buttons.send_message_button')}`, callback_data: 'send_button' },
      ],
      [
        { text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' },
      ],
    ];
  }


  /** Trade Settings Menu Buttons   */
  async tradeSettingsMenuButtons(settings: any): Promise<InlineKeyboardButton[][]> {
    return [[
      {
        text: `${this.i18n.translate('i18n.buttons.set_min_buy', { args: { minBuy: settings.minBuy } })}`,
        callback_data: 'set_minBuy',
      },
      {
        text: `${this.i18n.translate('i18n.buttons.set_slippage', { args: { slippage: settings.slippage } })}`,
        callback_data: 'set_slippage',
      }],
      [{
        text: settings.mevProtection?this.i18n.translate('i18n.buttons.turn_off_mev'):this.i18n.translate('i18n.buttons.turn_on_mev'),
        callback_data: 'change_mev_protection_setting',
      }],
      [{
        text: this.i18n.translate('i18n.buttons.priority_fee_no_action'),
        callback_data: 'no_action',
      }],
      [{
        text: this.i18n.translate('i18n.buttons.priority_fee_medium'),
        callback_data: 'change_priority_fee_medium',
      }, {
        text: this.i18n.translate('i18n.buttons.priority_fee_high'),
        callback_data: 'change_priority_fee_high',
      }],
      [{
        text: this.i18n.translate('i18n.buttons.priority_fee_ultimate'),
        callback_data: 'change_priority_fee_ultimate',
      },
        {
          text: `${this.i18n.translate('i18n.buttons.priority_fee', { args: { priorityFee: settings.priorityFee } })}`,
          callback_data: 'change_priority_fee_custom',
        }],
      [{
        text: `${this.i18n.translate('i18n.buttons.withdraw_wallet', { args: { withdrawWallet: settings.withdrawWallet || 'Not Selected' } })}`,
        callback_data: 'set_withdraw_wallet',
      }],
      [{ text: await this.i18n.translate('i18n.buttons.back'), callback_data: 'back_to_main' },
        { text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }]];
  }


  /** Alert Settings Menu Buttons   */
  async alertSettingsButtons(selectedMarketCapIds: number[]): Promise<InlineKeyboardButton[][]> {
    const marketCapButtons = [
      {
        id: 1,
        text: this.i18n.translate('i18n.buttons.marketcap_1k_100k'),
      },
      {
        id: 2,
        text: this.i18n.translate('i18n.buttons.marketcap_100k_1m'),
      },
      {
        id: 3,
        text: this.i18n.translate('i18n.buttons.marketcap_1m_10m'),
      },
      {
        id: 4,
        text: this.i18n.translate('i18n.buttons.marketcap_10m_plus'),
      },
    ];

    const buttons: InlineKeyboardButton[] = [
      {
        text: selectedMarketCapIds.includes(1) ? `✅ ${marketCapButtons[0].text}` : marketCapButtons[0].text,
        callback_data: 'set_marketCap_1k_100k',
      },
      {
        text: selectedMarketCapIds.includes(2) ? `✅ ${marketCapButtons[1].text}` : marketCapButtons[1].text,
        callback_data: 'set_marketCap_100k_1m',
      },
      {
        text: selectedMarketCapIds.includes(3) ? `✅ ${marketCapButtons[2].text}` : marketCapButtons[2].text,
        callback_data: 'set_marketCap_1m_10m',
      },
      {
        text: selectedMarketCapIds.includes(4) ? `✅ ${marketCapButtons[3].text}` : marketCapButtons[3].text,
        callback_data: 'set_marketCap_10m_plus',
      },
    ];

    return [
      [buttons[0], buttons[1]],
      [buttons[2], buttons[3]],
      [
        { text: this.i18n.translate('i18n.buttons.back'), callback_data: 'back_to_main' },
        { text: this.i18n.translate('i18n.buttons.close'), callback_data: 'close' },
      ],
    ];
  }


  /** Help Menu buttons   */
  async helpMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [{
        text: this.i18n.translate('i18n.buttons.faq'),
        callback_data: 'faq',
      }, {
        text: this.i18n.translate('i18n.buttons.join_community'),
        url: 'https://t.me/algorachat',
      }],
      [{ text: this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** FAQ Help Menu Buttons   */
  async faqMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [{ text: this.i18n.translate('i18n.buttons.back'), callback_data: 'back_to_help' }],
      [{ text: this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** Plan Menu Buttons   */
  async planMenuButtons(currentPlan: string): Promise<InlineKeyboardButton[][]> {
    return [
      [
        // {
        //   text: `${this.i18n.translate('i18n.buttons.bronze')} ${currentPlan === 'Bronze' ? '✅' : ''}`,
        //   callback_data: 'bronzePlan',
        // },
        // {
        //   text: `${this.i18n.translate('i18n.buttons.silver')} ${currentPlan === 'Silver' ? '✅️' : ''}`,
        //   callback_data: 'silverPlan',
        // },
        {
          text: `${this.i18n.translate('i18n.buttons.subscribe')} ${currentPlan === 'Subscribed' ? '✅️' : ''}`,
          callback_data: 'goldPlan',
        },
      ],
      [{ text: this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** Withdraw Invoice Confirmation Buttons   */
  async invoiceConfirmationButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [
        { text: this.i18n.translate('i18n.buttons.confirm'), callback_data: 'confirm_subscription' },
        { text: this.i18n.translate('i18n.buttons.cancel'), callback_data: 'cancel' }],
    ];
  }

  /** Wallet Menu Buttons   */
  async walletMenuButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [
        { text: this.i18n.translate('i18n.buttons.deposit_sol'), callback_data: 'deposit_sol' },
        { text: this.i18n.translate('i18n.buttons.withdraw_sol'), callback_data: 'withdraw_sol' }],
      [
        { text: this.i18n.translate('i18n.buttons.swap_sol_usdc'), callback_data: 'swap_sol_usdc' },
        { text: this.i18n.translate('i18n.buttons.swap_usdc_sol'), callback_data: 'swap_usdc_sol' },
      ],
      [
        { text: this.i18n.translate('i18n.buttons.export_pk'), callback_data: 'export_pk' },
      ],
      [{ text: this.i18n.translate('i18n.buttons.refresh'), callback_data: 'refresh' },
        { text: await this.i18n.translate('i18n.buttons.cancel'), callback_data: 'cancel' },
      ],
    ];
  }

  async exportPKClose(): Promise<InlineKeyboardButton[][]> {
    return [
      [{ text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    ];
  }

  /** Withdraw Wallet Confirmation Buttons   */
  async withdrawWalletConfirmationButtons(): Promise<InlineKeyboardButton[][]> {
    return [
      [
        { text: this.i18n.translate('i18n.buttons.confirm'), callback_data: 'confirm_withdraw' },
        { text: this.i18n.translate('i18n.buttons.cancel'), callback_data: 'cancel' }],
    ];
  }

  /** Wallet Menu Buttons   */
  async depositMenuButton(): Promise<InlineKeyboardButton[][]> {
    return [[{
      text: this.i18n.translate('i18n.buttons.back_to_wallet'),
      callback_data: 'back_to_wallet',
    }]];
  }

  /** Trade Menu Buttons   */
  async tradeButtons(settings: Settings, initialAmount: string): Promise<InlineKeyboardButton[][]> {
    const buttons = [

      [{ text: this.i18n.translate('i18n.buttons.buy_section'), callback_data: 'no_action' }],
      [
        {
          text: this.i18n.translate('i18n.buttons.1_sol_buy', { args: { amount: '1.0' } }),
          callback_data: 'buy_1_sol',
        },
        {
          text: this.i18n.translate('i18n.buttons.2_sol_buy', { args: { amount: '2.0' } }),
          callback_data: 'buy_2_sol',
        },
        {
          text: this.i18n.translate('i18n.buttons.0.2_sol_buy', { args: { amount: '0.2' } }),
          callback_data: 'buy_0.2_sol',
        },
      ],
      [
        {
          text: this.i18n.translate('i18n.buttons.min_buy', { args: { amount: `${settings.minBuy}` } }),
          callback_data: 'min_buy',
        },
        {
          text: this.i18n.translate('i18n.buttons.buy_x_sol', { args: { amount: 'x' } }),
          callback_data: 'buy_x_sol',
        },
      ],
      [{ text: this.i18n.translate('i18n.buttons.sell_section'), callback_data: 'no_action' }],
      [
        { text: this.i18n.translate('i18n.buttons.sell_10'), callback_data: 'sell_10' },
        { text: this.i18n.translate('i18n.buttons.sell_25'), callback_data: 'sell_25' },
        { text: this.i18n.translate('i18n.buttons.sell_50'), callback_data: 'sell_50' },
        { text: this.i18n.translate('i18n.buttons.sell_100'), callback_data: 'sell_100' },
      ],
    ];
    if (initialAmount !== null) {
      buttons.push([{
        text: await this.i18n.translate('i18n.buttons.sell_initial', { args: { initialAmount } }),
        callback_data: 'sell_initial',
      }]);
    }


    buttons.push(
      [{ text: this.i18n.translate('i18n.buttons.generate_pnl'), callback_data: 'generate_pnl' }],
      [{ text: await this.i18n.translate('i18n.buttons.close'), callback_data: 'close' }],
    );

    return buttons;
  }
}