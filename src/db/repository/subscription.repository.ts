import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Subscription } from '@prisma/client';
import { SubscriptionPlanName } from '@shared/enums';


@Injectable()
export class SubscriptionRepository {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService) {
  }

  async createSubscription(
    userId: number,
    plan: SubscriptionPlanName,
    amountUSDC: number,
    transactionHash: string,
  ): Promise<Subscription> {
    this.logger.log(`Creating new subscription for user ID: ${userId} with plan: ${plan} and amount: ${amountUSDC}`);
    return this.prisma.subscription.create({
      data: {
        userId,
        plan: plan,
        amountUSDC,
        transactionHash,
      },
    });
  }

  async checkSubscriptionStatus(userId: number): Promise<{
    isActive: boolean;
    expirationDate: Date | null;
    subscription: Subscription | null
  }> {
    this.logger.log(`Checking subscription status for user ID: ${userId}`);

    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        isActive: false,
        expirationDate: null,
        subscription: null,
      };
    }

    const expirationDate = new Date(subscription.createdAt);
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    return {
      isActive: expirationDate > new Date(),
      expirationDate,
      subscription,
    };
  }

  async updateSubscription(subscriptionId: number,
                           newPlan: SubscriptionPlanName,
                           amountUSDC: number,
                           transactionHash: string): Promise<Subscription> {
    this.logger.log(`Updating subscription ID: ${subscriptionId} to new plan: ${newPlan} with amount: ${amountUSDC}`);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: newPlan,
        amountUSDC,
        transactionHash,
        updatedAt: new Date(),
      },
    });
  }
}