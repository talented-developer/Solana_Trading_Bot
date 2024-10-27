import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { TextService } from '../service/text/text.service';
import { SubscriptionRepository } from '../../db/repository/subscription.repository';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../db/repository/user.repository';
import { SolanaService } from '../../providers/solana/solana.service';
import { UtilsService } from '../service/utils/utils.service';
import { channelLinks, SubscriptionPlanAmount, SubscriptionPlanName } from '@shared/enums';

@Wizard('plan')
export class PlanWizard {
  private readonly logger = new Logger(this.constructor.name);
  private readonly solanaInvoiceWalletAddress: string;

  constructor(
    private readonly i18n: I18nService,
    private readonly subscriptionService: SubscriptionRepository,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    private readonly userService: UserRepository,
    private readonly utilsService: UtilsService,
  ) {
    this.solanaInvoiceWalletAddress = this.configService.get<string>('blockchain.solana.solanaInvoiceWalletAddress');
  }

  @WizardStep(0)
  async step0(ctx) {
    await this.handleCommand(ctx);
  }

  private async handleCommand(ctx) {
    return this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));
  }

  private async startNewInstance(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    await this.utilsService.startNewInstance(
      ctx,
      'plan',
      this.getPlanMessage.bind(this, telegramId),
      this.getPlanButtons.bind(this, telegramId),
      this.textService.sendMessageWithButtons.bind(this.textService),
    );
  }

  private async getPlanButtons(telegramId: bigint) {
    const user = await this.userService.getUserByTelegramId(telegramId);
    const { isActive, subscription } = await this.subscriptionService.checkSubscriptionStatus(user.id);
    const planName = subscription ? subscription.plan : 'None';
    return this.markupButtonsService.planMenuButtons(planName);
  }

  private async getPlanMessage(telegramId: bigint) {
    const user = await this.userService.getUserByTelegramId(telegramId);
    const { isActive, subscription, expirationDate } = await this.subscriptionService.checkSubscriptionStatus(user.id);
    const plan = isActive ? '✅' : '❌';
    const expirationDateString = expirationDate ? expirationDate.toISOString().split('T')[0] : 'N/A';
    return this.i18n.translate('i18n.plan_message', {
      args: {
        currentPlan: plan,
        expirationDate: expirationDateString,
      },
    });
  }

  private async createNewSubscription(userId: number, plan: SubscriptionPlanName, amountUSDC: number, transactionHash: string) {
    return this.subscriptionService.createSubscription(userId, plan, amountUSDC, transactionHash);
  }

  private async sendTransactionSuccessMessage(ctx, transactionDetails, plan: string) {
    const channelLink = await this.getChannelLink(plan);
    const message = this.i18n.translate('i18n.success_messages.subscription_success', {
      args: {
        solana: transactionDetails,
        tier_channel_link: channelLink,
      },
    });
    await this.textService.sendMessageNoButtons(ctx, message);
  }

  private async getChannelLink(plan: string): Promise<string> {
    return channelLinks[plan as keyof typeof channelLinks];
  }

  private async sendTransactionFailedMessage(ctx, error: Error) {
    const message = this.i18n.translate('i18n.error_messages.transaction_failed_error', { args: { error } });
    await ctx.reply(message);
  }

  private async sendInvoiceConfirmationMessage(ctx, plan: string, amount: number, isUpdate: boolean, currentPlan: string = '') {
    const action = isUpdate
      ? 'plan_confirmation_update'
      : 'plan_confirmation_subscribe';
    const message: string = this.i18n.translate(`i18n.${action}`, { args: { plan, amount, currentPlan } });
    const buttons = await this.markupButtonsService.invoiceConfirmationButtons();
    await this.textService.sendMessageWithButtons(ctx, message, buttons);
  }

  async confirmSubscriptionTransaction(ctx, isUpdate = false) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const plan = ctx.scene.state.plan;
    const amountUSDC = SubscriptionPlanAmount[plan as keyof typeof SubscriptionPlanAmount];

    try {
      const user = await this.userService.getUserByTelegramId(telegramId);
      const { isActive, subscription } = await this.subscriptionService.checkSubscriptionStatus(user.id);
      const fromSecretKey = await this.userService.getUserSecretKey(user.id);

      const hasSufficientBalance = await this.solanaService.checkUserSolBalance(user.walletAddress);
      if (!hasSufficientBalance) {
        const message = this.i18n.translate('i18n.error_messages.insufficient_balance');
        await this.textService.sendErrorMessage(ctx, message);
        this.logger.debug('Insufficient balance, leaving scene');
        ctx.scene.leave();
        return;
      }

      const transactionHash = await this.solanaService.sendUSDCWithKey(
        fromSecretKey,
        this.solanaInvoiceWalletAddress,
        amountUSDC,
      );

      const transactionDetails = this.solanaService.createTransactionDetails(
        transactionHash,
        user.walletAddress,
        this.solanaInvoiceWalletAddress,
        `subscription ${plan}`,
        amountUSDC,
        0,
      );

      if (isUpdate && isActive) {
        await this.subscriptionService.updateSubscription(subscription.id, plan, amountUSDC, transactionHash);
      } else {
        await this.createNewSubscription(user.id, plan, amountUSDC, transactionHash);
      }

      await this.sendTransactionSuccessMessage(ctx, transactionDetails, plan);
    } catch (error) {
      const errorMessage = this.i18n.translate('i18n.error_messages.transaction_failed_error', { args: { error: error.message } });
      await this.sendTransactionFailedMessage(ctx, new Error(errorMessage));
    } finally {
      await ctx.scene.leave();
    }
  }

  private async handleSubscription(ctx, plan: string) {
    ctx.scene.state.plan = plan;
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const { isActive, subscription } = await this.subscriptionService.checkSubscriptionStatus(user.id);
    const amountUSDC = SubscriptionPlanAmount[plan as keyof typeof SubscriptionPlanAmount];

    await this.sendInvoiceConfirmationMessage(ctx, plan, amountUSDC, isActive, isActive ? subscription.plan : '');
    ctx.wizard.selectStep(1);
  }

  //@ts-ignore
  @Action('confirm_subscription')
  async handleConfirmPayment(ctx) {
    await this.textService.autoDeleteMessage(ctx, async () => {
        await this.confirmSubscriptionTransaction(ctx, true);
      },
      this.i18n.translate('i18n.transactions.initializing_transaction'));
    await ctx.deleteMessage();
  }

  //@ts-ignore
  @Action('cancel_payment')
  async handleCancelPayment(ctx) {
    ctx.scene.state = {};
    try {
      await ctx.deleteMessage();
    } catch (error) {
      this.logger.warn('Message to delete not found');
    }
    await ctx.scene.leave();
  }

  // //@ts-ignore
  // @Action('bronzePlan')
  // async handleBronzePlan(ctx) {
  //   await this.handleSubscription(ctx, 'Bronze');
  // }
  //
  // //@ts-ignore
  // @Action('silverPlan')
  // async handleSilverPlan(ctx) {
  //   await this.handleSubscription(ctx, 'Silver');
  // }

  //@ts-ignore
  @Action('goldPlan')
  async handleGoldPlan(ctx) {
    await this.handleSubscription(ctx, 'Gold');
  }

  //@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    try {
      await ctx.deleteMessage();
    } catch (error) {
      this.logger.warn('Message to delete not found');
    }
    await ctx.scene.leave();
  }

  //@ts-ignore
  @Action('cancel')
  async cancel(ctx) {
    ctx.scene.state = {};
    try {
      await ctx.deleteMessage();
    } catch (error) {
      this.logger.warn('Message to delete not found');
    }
    await ctx.scene.leave();
  }
}