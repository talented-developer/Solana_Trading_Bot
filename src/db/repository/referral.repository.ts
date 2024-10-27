import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../services/prisma.service';
import { ClaimRepository } from './claim.repository';
import { Subscription, Transaction, User } from '@prisma/client';
import { thresholdValues } from '@shared/types/threshold';
import { RewardsType } from '@shared/enums';

@Injectable()
export class ReferralRepository implements OnModuleInit {
  private readonly logger = new Logger(ReferralRepository.name);
  private userService: UserRepository;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private moduleRef: ModuleRef,
    private readonly claimService: ClaimRepository,
  ) {
  }

  onModuleInit() {
    this.userService = this.moduleRef.get(UserRepository, { strict: false });
  }

  async generateRefereeRefLink(userId: number): Promise<string> {
    const defaultLength = this.configService.get<number>('telegram.bot.referralStringLength');
    const refLink = this.generateRandomString(defaultLength);
    const existingUser = await this.prisma.user.findUnique({
      where: { refLink },
    });

    if (existingUser) {
      return this.generateRefereeRefLink(userId);
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refLink },
      });

      return refLink;
    }
  }

  private generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


  async getUserRefLink(telegramId: bigint): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    }) as User;

    return user?.refLink || null;
  }

  async getInviter(userId: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    }) as User;

    if (!user || !user.inviterId) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { id: user.inviterId },
    });
  }

  async getReferredCount(userId: number): Promise<number> {
    return this.prisma.user.count({
      where: { inviterId: userId },
    });
  }

  async getTotalReferralRewards(userId: number): Promise<{ totalSol: number, totalUSDC: number }> {
    const claims = await this.claimService.getClaimsByUser(userId);
    let totalSol = 0;
    let totalUSDC = 0;

    claims.forEach(claim => {
      totalSol += claim.amountSol;
      totalUSDC += claim.amountUSDC;
    });

    return { totalSol, totalUSDC };
  }

  async getTransactionsForUser(inviterId: number, lastClaimTime: Date | null): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        userId: inviterId,
        ...(lastClaimTime && { createdAt: { gt: lastClaimTime } }),
      },
    });
  }

  async getSubscriptionsForUser(inviterId: number, lastClaimTime: Date | null): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        user: {
          inviterId,
        },
        ...(lastClaimTime && { createdAt: { gt: lastClaimTime } }),
      },
    });
  }

  private async getSolRewards(inviterId: number, lastClaimTime: Date | null): Promise<number> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        user: {
          inviterId: inviterId,  // Это правильный пользователь
        },
        ...(lastClaimTime && { createdAt: { gt: lastClaimTime } }),
      },
    });

    this.logger.debug(`Transactions for invitees of userId: ${inviterId}: ${JSON.stringify(transactions)}`);

    const rewardRate = thresholdValues.rewardPerSwapToInviter;
    let totalReward = 0;

    transactions.forEach((transaction) => {
      const amountSol = parseFloat(transaction.amountSol);

      if (!isNaN(amountSol)) {
        totalReward += amountSol * rewardRate;
      } else {
        this.logger.debug(`Invalid amountSol value: ${transaction.amountSol} for transaction ${transaction.id}`);
      }
    });

    this.logger.debug(`Total SOL reward for inviterId ${inviterId}: ${totalReward}`);
    return totalReward;
  }


  private async getUSDCRewards(userId: number, lastClaimTime: Date | null): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        user: {
          inviterId: userId,
        },
        ...(lastClaimTime && { createdAt: { gt: lastClaimTime } }),
      },
    });

    this.logger.debug(`Subscriptions for inviter (userId: ${userId}): ${JSON.stringify(subscriptions)}`);

    const rewardRate = thresholdValues.rewardPerSubscriptionToInviter;
    let totalReward = 0;

    subscriptions.forEach((subscription) => {
      this.logger.debug(`Processing subscription: ${JSON.stringify(subscription)}`);
      totalReward += subscription.amountUSDC * rewardRate;
    });

    this.logger.debug(`Total USDC reward for userId ${userId}: ${totalReward}`);
    return totalReward;
  }

  async getLastClaimTime(userId: number): Promise<Date | null> {
    const lastClaim = await this.claimService.getLastClaimByUser(userId);

    return lastClaim
      ? lastClaim.claimedAt
      : null;
  }

  async getRefLinkByUserId(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    }) as User;
    return user?.refLink || null;
  }

  async updateUserRefLink(userId: number, refLink: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refLink },
    });
  }


  async calculateReferralRewards(userId: number, rewardType: string): Promise<number> {
    const lastClaimTime = await this.getLastClaimTime(userId);
    if (rewardType === RewardsType.ClaimSol) {
      return this.getSolRewards(userId, lastClaimTime);
    } else if (rewardType === RewardsType.ClaimUSDC) {
      return this.getUSDCRewards(userId, lastClaimTime);
    }
    return null;
  }
}