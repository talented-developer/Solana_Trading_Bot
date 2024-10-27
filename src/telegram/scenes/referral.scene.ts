import { PrismaService } from '@db/services/prisma.service';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UtilsService } from '../service/utils/utils.service';
import { MarkupButtonsService } from '../service/buttons/button.service';
import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { ReferralRepository } from '../../db/repository/referral.repository';
import { TextService } from '../service/text/text.service';
import { UserRepository } from '../../db/repository/user.repository';
import { ClaimRepository } from '../../db/repository/claim.repository';
import { SolanaService } from '../../providers/solana/solana.service';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import constants from '@shared/constants';
import { thresholdValues } from '@shared/types/threshold';
import { RewardsType } from '@shared/enums';

@Wizard('referral')
export class ReferralWizard {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly utilsService: UtilsService,
    private readonly markupButtonsService: MarkupButtonsService,
    private readonly referralService: ReferralRepository,
    private readonly textService: TextService,
    private readonly userService: UserRepository,
    private readonly claimService: ClaimRepository,
    private readonly solanaService: SolanaService,
  ) {
  }

  @WizardStep(0)
  async handleReferralCommand(ctx) {
    await this.processCommand(ctx);
  }

  private async processCommand(ctx) {
    const commandHandled = await this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));
    if (!commandHandled) {
      await this.startNewInstance(ctx);
    }
  }

  private async startNewInstance(ctx) {
    const referralDetails = await this.getReferralDetails(ctx);
    const offset = constants.ref_id_mask;
    this.logger.log(`totalSol to claim: ${referralDetails.claimRewardsSol}`);
    this.logger.log(`totalUSDC to claim: ${referralDetails.claimRewardsUSDC}`);


    const template = this.i18n.translate('i18n.referral_menu', {
      args: {
        referral_id: (Number(referralDetails.referralId) + offset).toString(),
        referral_link: referralDetails.referralLink,
        referred_users: referralDetails.referredUsers,
        claim_rewards_sol: referralDetails.claimRewardsSol,
        claim_rewards_usdc: referralDetails.claimRewardsUSDC,
      },
    });

    const formattedReferralText = this.utilsService.formatText(template, referralDetails);
    const buttons = await this.markupButtonsService.referralMenuButtons();

    await ctx.reply(formattedReferralText, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }

  private async getReferralDetails(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    let refLink = await this.referralService.getRefLinkByUserId(user.id);
    if (!refLink) {
      refLink = await this.referralService.generateRefereeRefLink(user.id);
    }

    const referralCount = await this.referralService.getReferredCount(user.id);
    const totalSol = await this.referralService.calculateReferralRewards(user.id, RewardsType.ClaimSol);
    this.logger.log(`getReferralDetails totalSol to claim: ${totalSol}`);
    const totalUSDCinLamports = await this.referralService.calculateReferralRewards(user.id, RewardsType.ClaimUSDC);
    const totalUSDC = totalUSDCinLamports / LAMPORTS_PER_SOL;
    this.logger.log(`totalUSDC to claim: ${totalUSDC}`);
    const fullRefLink = `https://t.me/algoracallbot?start=r-${refLink}`;
    const formattedTotalUSDCinLamports = totalUSDCinLamports.toFixed(4) || '0';

    return {
      referralId: user.id.toString(),
      referralLink: fullRefLink,
      referredUsers: referralCount.toString(),
      claimRewardsSol: totalSol.toFixed(4) || '0',
      claimRewardsUSDC: formattedTotalUSDCinLamports,
    };
  }

  private async processClaim(ctx, rewardType: string) {
    const { user, totalRewards } = await this.getUserAndRewards(ctx, rewardType);

    if (this.isEligibleForClaim(totalRewards, rewardType)) {
      const transactionHash = await this.sendRewardTransaction(user.walletAddress, totalRewards, rewardType);
      await this.saveClaimToDatabase(user.id,
        rewardType === RewardsType.ClaimSol
          ? totalRewards : 0,
        rewardType === RewardsType.ClaimUSDC
          ? totalRewards : 0, transactionHash);

      const successMessage = this.createSuccessMessage(user.walletAddress, totalRewards, rewardType, transactionHash);
      await this.sendMessage(ctx, successMessage);
    } else {
      const errorMessage = this.i18n.translate('i18n.error_messages.no_rewards_error');
      await this.sendMessage(ctx, errorMessage);
    }

    ctx.scene.leave();
  }

  private async sendMessage(ctx, message: string) {
    await this.textService.sendMessageNoButtons(ctx, message);
  }

  private async getUserAndRewards(ctx, rewardType: string) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const user = await this.userService.getUserByTelegramId(telegramId);
    const totalRewards = await this.referralService.calculateReferralRewards(user.id, rewardType);
    return { user, totalRewards };
  }

  private isEligibleForClaim(totalRewards: number, rewardType: string): boolean {
    const minClaim = rewardType === RewardsType.ClaimSol ? thresholdValues.minimalSOLToClaim : thresholdValues.minimalUSDCToClaim;
    return totalRewards >= minClaim;
  }

  private async sendRewardTransaction(walletAddress: string, totalRewards: number, rewardType: string): Promise<string> {
    switch (rewardType) {
      case RewardsType.ClaimSol:
        this.logger.debug(`Rewards SOL to claim: ${Math.floor(totalRewards)}`);
        return await this.solanaService.sendSolFromRewardsWallet(walletAddress, Math.floor(totalRewards));
      case RewardsType.ClaimUSDC:
        this.logger.debug(`Rewards USDC to claim: ${totalRewards}`);
        return await this.solanaService.sendUsdcFromRewardsWallet(walletAddress, totalRewards);
      default:
        throw new Error(`Unsupported reward type: ${rewardType}`);
    }
  }

  private createSuccessMessage(walletAddress: string, totalRewards: number, rewardType: string, transactionHash: string): string {
    return this.i18n.translate('i18n.success_messages.claim_success', {
      args: {
        amount: rewardType === RewardsType.ClaimSol
          ? (totalRewards / LAMPORTS_PER_SOL).toFixed(6)
          : (totalRewards / LAMPORTS_PER_SOL).toFixed(2),
        rewardType: rewardType.toUpperCase(),
        transactionHash,
        from: walletAddress,
        to: walletAddress,
        solscanUrl: `https://solscan.io/tx/${transactionHash}`,
      },
    });
  }


  private async saveClaimToDatabase(userId: number, amountSol: number, amountUSDC: number, transactionHash: string) {
    await this.claimService.createClaim(userId, amountSol, amountUSDC, transactionHash);
  }


  //@ts-ignore
  @Action('claim_rewards_sol')
  async claimRewardsSol(ctx) {
    await this.processClaim(ctx, RewardsType.ClaimSol);
  }

  //@ts-ignore
  @Action('claim_rewards_usdc')
  async claimRewardsUSDC(ctx) {
    await this.processClaim(ctx, RewardsType.ClaimUSDC);
  }

  //@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage();
    await ctx.scene.leave();
  }
}