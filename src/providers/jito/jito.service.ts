import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, GetLatestBlockhashConfig, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import * as bs58 from 'bs58';
import axios from 'axios';
import { UserRepository } from '../../db/repository/user.repository';
import { SolanaService } from '../solana/solana.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LatestBlockhash, SendTransactionResponse } from '../utils/types';

@Injectable()
export class JitoService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly jitoEndpoints: string[];
  private readonly jitoTipAccounts: string[];
  connection: Connection;

  constructor(
    private configService: ConfigService,
    connection: Connection,
    private userService: UserRepository,
    private solanaService: SolanaService,
    private httpService: HttpService,
  ) {
    this.connection = connection;
    this.jitoEndpoints = this.configService.get<string[]>('blockchain.jito.ednpotins');
    this.jitoTipAccounts = this.configService.get<string[]>('blockchain.jito.tipAccounts');
  }

  async sendTransactionRequest(transaction: VersionedTransaction, priorityFeeLamports: string): Promise<string> {
    const serializedTransaction = bs58.encode(transaction.serialize());
    this.logger.debug(`Serialized Transaction: ${serializedTransaction}`);

    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [serializedTransaction, { prioritizationFeeLamports: parseInt(priorityFeeLamports) }],
    };
    const headers = { 'Content-Type': 'application/json' };
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.jitoEndpoints[0]}/transactions`, requestBody, { headers }));
      if (response.data.error) {
        throw new Error(`Failed to send transaction. Error: ${JSON.stringify(response.data.error)}`);
      }
      return response.data.result;
    } catch (error) {
      this.logger.error(`Error occurred: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response Status: ${error.response.status}`);
        this.logger.error(`Response Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async sendBundleRequest(serializedTransactions: string[], signature: string, latestBlockhash: LatestBlockhash): Promise<SendTransactionResponse> {
    const request = this.jitoEndpoints.map((url: string) => 
      axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendBundle',
        params: [serializedTransactions]}, {
          headers: { 'Content-Type': 'application/json' }
        })
    );
    
    this.logger.log('Jito: Sending transactions to endpoints...');
    
    const results = await Promise.all(request.map((result: any) => result.catch((e: any) => e)));

    const successfulResults = results.filter((result) => !(result instanceof Error));

    if (successfulResults.length > 0) {
      this.logger.log('Jito: At least one successful response');
      this.logger.log('Jito: Confirming transaction...');

      return await this.checkTransactionStatus(signature, latestBlockhash);
    } else {
      this.logger.log('Jito: No successful responses received for jito');
    }

    return { confirmed: false };
  }

  private async buildAndSignTransaction(
    wallet: any,
    user: any,
    transactionData: string,
  ): Promise<VersionedTransaction> {
    const fromSecretKey = await this.userService.getUserSecretKey(user.id);
    const secretKeyBuffer = bs58.decode(fromSecretKey);
    const userKeypair = Keypair.fromSecretKey(new Uint8Array([...secretKeyBuffer]));

    const transaction = await this.solanaService.buildTransaction(wallet, transactionData);
    transaction.sign([userKeypair]);

    return transaction;
  }

  private async signTransaction(
    transaction: Transaction,
    userKeypair: Keypair,
  ): Promise<string> {
    transaction.sign(userKeypair);
    return bs58.encode(transaction.serialize());
  }
  //
  // async sendBundle(
  //   wallet: any,
  //   user: any,
  //   publicKey: PublicKey,
  //   swapTransactionData: string,
  //   tipAccount: string,
  //   tipAmount: number,
  //   transactionType,
  //   referralAccount?: string,
  //   referralFeeLamports?: number,
  //   developerFeeLamports?: number,
  // ): Promise<string> {
  //   const recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
  //   const feeAccountAddress = this.configService.get<string>('blockchain.solana.feeAccountAddress');
  //   const userKeypair = Keypair.fromSecretKey(
  //     new Uint8Array([...bs58.decode(await this.userService.getUserSecretKey(user.id))]),
  //   );
  //   this.logger.debug('Building and signing swap transaction');
  //   let swapTransaction: VersionedTransaction;
  //   let tipTransaction: Transaction;
  //   let developerFeeTransaction: Transaction;
  //   this.logger.debug(`transactionType: ${transactionType}`);
  //   if (transactionType === 'buy') {
  //     this.logger.debug('Executing buy transaction');
  //     this.logger.debug(`tipAccount: ${tipAccount}`);
  //     swapTransaction = await this.buildAndSignTransaction(wallet, user, swapTransactionData);
  //     tipTransaction = await this.createTransferTransaction(publicKey, new PublicKey(tipAccount), BigInt(tipAmount), recentBlockhash);
  //     await this.signTransaction(tipTransaction, userKeypair);
  //     developerFeeTransaction = await this.createTransferTransaction(publicKey, new PublicKey(feeAccountAddress), BigInt(developerFeeLamports), recentBlockhash);
  //     await this.signTransaction(developerFeeTransaction, userKeypair);
  //   } else if (transactionType === 'sell') {
  //     this.logger.debug('Executing sell transaction');
  //     this.logger.debug(`tipAccount: ${tipAccount}`);
  //
  //     swapTransaction = await this.buildAndSignTransaction(wallet, user, swapTransactionData);
  //     tipTransaction = await this.createTransferTransaction(publicKey, new PublicKey(tipAccount), BigInt(tipAmount), recentBlockhash);
  //     await this.signTransaction(tipTransaction, userKeypair);
  //     developerFeeTransaction = await this.createTransferTransaction(publicKey, new PublicKey(feeAccountAddress), BigInt(developerFeeLamports), recentBlockhash);
  //     await this.signTransaction(developerFeeTransaction, userKeypair);
  //   }
  //   const firstTransactionSignature = bs58.encode(swapTransaction.signatures[0]);
  //   this.logger.debug(`First Transaction Signature (Hash): ${firstTransactionSignature}`);
  //
  //   let referralTransaction: Transaction | null = null;
  //   if (referralAccount && referralFeeLamports) {
  //     referralTransaction = await this.createTransferTransaction(publicKey, new PublicKey(referralAccount), BigInt(referralFeeLamports), recentBlockhash);
  //     const serializedReferralTransaction = await this.signTransaction(referralTransaction, userKeypair);
  //     this.logger.debug(`Serialized Referral Transaction: ${serializedReferralTransaction}`);
  //   }
  //
  //   const legacyTransactions = [tipTransaction, developerFeeTransaction, referralTransaction].filter((tx): tx is Transaction => tx !== null);
  //   const versionedTransactions: VersionedTransaction[] = [swapTransaction];
  //   const legacyParamsArray = await Promise.all(legacyTransactions.map(tx => this.signTransaction(tx, userKeypair)));
  //   const versionedParamsArray = versionedTransactions.map(tx => {
  //     if (tx instanceof VersionedTransaction) {
  //       return bs58.encode(tx.serialize());
  //     }
  //     throw new Error('Expected VersionedTransaction but got Transaction');
  //   });
  //   const paramsArray = [...versionedParamsArray, ...legacyParamsArray];
  //
  //   await this.sendBundleRequest(paramsArray);
  //
  //   return firstTransactionSignature;
  // }

  private async checkTransactionStatus(signature: string, latestBlockhash: any): Promise<SendTransactionResponse> {
    const confirmation = await this.connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      this.connection.commitment,
    );
  
    return { confirmed: !confirmation.value.err, signature };
  }

  getRandomTipAccount (): PublicKey {
    const randomValidator = this.jitoTipAccounts[Math.floor(Math.random() * this.jitoTipAccounts.length)];
    return new PublicKey(randomValidator);
  }
}