import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService) {
  }

  async createInitialTokenPurchase(
    userId: number,
    tokenAddress: string,
    transactionHash: string,
    amountTokens: number,
    amountSol: number,
    pricePerToken: string,
    solPriceInUsdc: string,
  ) {
    const existingTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        tokenAddress,
      },
    });
    const isInitial = existingTransactions.length === 0;

    await this.prisma.transaction.create({
      data: {
        userId,
        tokenAddress,
        transactionHash,
        amountTokens: amountTokens.toString(),
        amountSol: amountSol.toString(),
        pricePerToken,
        solPriceInUsdc,
        isInitial: isInitial,
      },
    });
  }

  async createTransaction(
    userId: number,
    tokenAddress: string,
    transactionHash: string,
    amountTokens: string,
    amountSol: string,
    pricePerToken: string,
    solPriceInUsdc: string,
    isInitial: boolean,
  ): Promise<Transaction> {
    this.logger.log(`Creating transaction for user ID: ${userId}, token address: ${tokenAddress}, transaction hash: ${transactionHash}, amountTokens: ${amountTokens}, amountSol: ${amountSol}, pricePerToken: ${pricePerToken}, solPriceInUsdc: ${solPriceInUsdc}, isInitial: ${isInitial}`);
    return this.prisma.transaction.create({
      data: {
        userId,
        tokenAddress,
        transactionHash,
        amountTokens,
        amountSol,
        pricePerToken,
        solPriceInUsdc,
        isInitial,
      },
    });
  }

  async createTransactionIfNotExistsInDB(
    userId: number,
    tokenAddress: string,
    transactionHash: string,
    amountTokens: string,
    amountSol: string,
    pricePerToken: string,
    solPriceInUsdc: string,
    isInitial: boolean,
  ): Promise<Transaction | null> {
    const existingTransaction = await this.getTransactionByHash(transactionHash);
    if (existingTransaction) {
      return null;
    }
    const existingInitialTransaction = await this.getInitialTransaction(userId, tokenAddress);
    if (existingInitialTransaction) {
      isInitial = false;
    }

    return this.createTransaction(userId, tokenAddress, transactionHash, amountTokens, amountSol, pricePerToken, solPriceInUsdc, isInitial);
  }

  async getInitialTransaction(userId: number, tokenAddress: string): Promise<Transaction | null> {
    this.logger.log(`Fetching initial transaction record for user ID: ${userId}, token address: ${tokenAddress}`);
    return this.prisma.transaction.findFirst({
      where: { userId, tokenAddress, isInitial: true },
    });
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    this.logger.log(`Fetching transactions for user ID: ${userId}`);
    return this.prisma.transaction.findMany({
      where: { userId },
    });
  }

  async getTransactionsByUserAndToken(userId: number, tokenAddress: string): Promise<Transaction[]> {
    this.logger.log(`Fetching transactions for user ID: ${userId} and token address: ${tokenAddress}`);
    return this.prisma.transaction.findMany({
      where: { userId, tokenAddress },
    });
  }

  async getTransactionByHash(transactionHash: string): Promise<Transaction | null> {
    this.logger.log(`Fetching transaction with hash: ${transactionHash}`);
    return this.prisma.transaction.findUnique({
      where: { transactionHash },
    });
  }
}