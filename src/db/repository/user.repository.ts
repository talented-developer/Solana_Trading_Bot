import { ForbiddenException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, User, UserSecret } from '@prisma/client';
import { ModuleRef } from '@nestjs/core';
import { ReferralRepository } from './referral.repository';
import { SolanaService } from '../../providers/solana/solana.service';
import { SubscriptionPlanName } from '@shared/enums';

@Injectable()
export class UserRepository implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private referralService: ReferralRepository;
  private solanaService: SolanaService;

  constructor(
    private prisma: PrismaService,
    private moduleRef: ModuleRef,
  ) {

  }

  private initialReferralId = 1920051;

  private readonly validRoles = ['PRIMITIVE', 'ADMIN', 'INFLUENCER'];

  onModuleInit() {
    this.referralService = this.moduleRef.get(ReferralRepository, { strict: false });
    this.solanaService = this.moduleRef.get(SolanaService, { strict: false });
  }

  async createUser(data: {
    chatId: bigint;
    telegramId: bigint;
    walletAddress?: string;
    inviterId?: number;
    telegramUsername?: string;
    telegramFirstName?: string;
    role?: string;
  }): Promise<User | null> {
    this.logger.log(`Creating new user with data: ${JSON.stringify(data)}`);
    const solanaWallet = this.solanaService.generateSolanaWallet();
    const userRole = this.validRoles.includes(data.role) ? data.role : 'PRIMITIVE'; // Изменено на userRole
    const selectedMarketCapRanges = [1, 2];

    const newUser = await this.prisma.user.create({
      data: {
        telegramId: data.telegramId,
        walletAddress: solanaWallet.publicKey,
        inviterId: data.inviterId,
        refLink: '', // Initially empty
        createdAt: new Date(),
        updatedAt: new Date(),
        role: userRole, // Изменено на userRole
        userDetails: {
          create: {
            telegramFirstName: data.telegramFirstName || null,
            telegramUsername: data.telegramUsername || null,
          },
        },
        Settings: { create: {} },
        userSecret: { create: { secretKey: solanaWallet.secretKey } },
      },
      select: {
        id: true,
      },
    });

    const marketCapRangesString = selectedMarketCapRanges.join(',');

    await this.prisma.alertSettings.create({
      data: {
        userId: newUser.id,
        marketCapRanges: marketCapRangesString,
      },
    });

    let refLink: string;
    let isUnique = false;

    // Generate unique refLink
    while (!isUnique) {
      const nextReferralId = this.initialReferralId++;
      refLink = `${nextReferralId}`;
      const existingUser = await this.prisma.user.findUnique({
        where: { refLink },
      });
      isUnique = !existingUser; // Check if the refLink is unique
    }

    return this.prisma.user.update({
      where: { id: newUser.id },
      data: { refLink },
    });
  }

  async getAllTelegramIds(): Promise<bigint[]> {
    const users = await this.prisma.user.findMany({
      select: { telegramId: true },
    });

    return users.map(user => user.telegramId);
  }

  async getUserByTelegramId(telegramId: bigint): Promise<User | null> {
    this.logger.debug(`Fetching user with telegramId: ${telegramId} including settings`);
    return this.prisma.user.findUnique({
      where: { telegramId },
      include: { Settings: true },
    });
  }


  async getGoldTierChatIds(): Promise<bigint[]> {
    const goldUsers = await this.prisma.user.findMany({
      where: {
        subscriptions: {
          some: { plan: SubscriptionPlanName.Gold },
        },
      },
      select: { telegramId: true },
    });

    return goldUsers.map(user => user.telegramId);
  }

  async getAdminTierChatIds(): Promise<bigint[]> {
    const goldUsers = await this.prisma.user.findMany({
      where: {
        subscriptions: {
          some: { plan: SubscriptionPlanName.Admin },
        },
      },
      select: { telegramId: true },
    });

    return goldUsers.map(user => user.telegramId);
  }

  async getByRefLink(refLink: string): Promise<User | null> {
    this.logger.debug(`Fetching user with refLink: ${refLink}`);
    return this.prisma.user.findFirst({
      where: { refLink },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    this.logger.debug(`Fetching user with userId: ${userId}`);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { Settings: true },
    });
    return user || null;
  }


  async deleteUser(where: Prisma.UserWhereUniqueInput, requestingUser: User): Promise<User> {
    const userToDelete = await this.prisma.user.findUnique({ where }) as User;
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userToDelete?.id) {
      throw new ForbiddenException('You do not have permission to delete this user.');
    }

    this.logger.log(`Deleting user where: ${JSON.stringify(where)}`);
    return this.prisma.user.delete({
      where,
    });
  }

  async getUserSecretKey(userId: number) {
    const userSecret = await this.prisma.userSecret.findUnique({
      where: { userId },
      select: { secretKey: true },
    }) as UserSecret;

    return userSecret.secretKey;
  }

  async getUserRole(telegramId: bigint): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      select: { role: true },
    });

    return user ? user.role : null;
  }
}