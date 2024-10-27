import { PrismaService } from '../services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Claim } from '@prisma/client';

@Injectable()
export class ClaimRepository {
  constructor(private prisma: PrismaService) {
  }

  async createClaim(userId: number, amountSol: number, amountUSDC: number, transactionHash: string): Promise<Claim> {
    return this.prisma.claim.create({
      data: {
        userId,
        amountSol,
        amountUSDC,
        transactionHash,
        claimedAt: new Date(),
      },
    });
  }

  async getClaimsByUser(userId: number): Promise<Claim[]> {
    return this.prisma.claim.findMany({
      where: { userId },
      orderBy: { claimedAt: 'desc' },
    });
  }

  async getLastClaimByUser(userId: number): Promise<Claim | null> {
    return this.prisma.claim.findFirst({
      where: { userId },
      orderBy: { claimedAt: 'desc' },
    });
  }
}
