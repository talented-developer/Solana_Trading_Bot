import { Injectable, Logger } from '@nestjs/common';
import {
  AddressLookupTableAccount,
  Blockhash,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  MessageV0,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as bs58 from 'bs58';
import { ConfigService } from '@nestjs/config';
import {
  AccountLayout,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';
import { Wallet } from '@coral-xyz/anchor';
import { UtilsService, ValidationResult } from '../../telegram/service/utils/utils.service';
import { Metadata } from '@shared/types/metadata';
import { Buffer } from 'buffer';
import { I18nService } from 'nestjs-i18n';
import constants from '@shared/constants';
import { TokenMetadataService } from '../utils/fetch-token-metadata';
import axios from 'axios';
import { LatestBlockhash } from '../utils/types';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly connection: Connection;
  private readonly feeAccountAddress: string;
  private requestCount = 0;
  private lastRequestTime = 0;
  private REQUESTS_PER_SECOND = 10;
  private MAX_RETRIES = 5;
  private BASE_RETRY_DELAY_MS = 500;
  private rewardsPrivateKey: string;
  private rewardsPublicKey: string;

  constructor(
    private readonly i18n: I18nService,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private tokenMetadataService: TokenMetadataService,
  ) {

    const heliusRpcUrl = this.configService.get<string>('blockchain.solana.rpcUrl');
    this.rewardsPrivateKey = this.configService.get<string>('blockchain.solana.rewardsPrivateKey');
    this.rewardsPublicKey = this.configService.get<string>('blockchain.solana.feeAccountAddress');
    this.feeAccountAddress = this.configService.get<string>('blockchain.solana.feeAccountAddress');
 
    this.connection = new Connection(heliusRpcUrl, { commitment: 'confirmed' });
  }

  private async rateLimit<T>(callback: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const interval = 1000 / this.REQUESTS_PER_SECOND;
    const delay = Math.max(0, this.lastRequestTime + interval - now);

    await new Promise(resolve => setTimeout(resolve, delay));
    this.lastRequestTime = Date.now();

    return callback();
  }

  async getMultipleAccountsSolBalances(publicKeys: string[]): Promise<Record<string, number>> {
    this.requestCount++;
    const keys = publicKeys.map(key => new PublicKey(key));

    const accountInfos = await this.rateLimit(() => this.connection.getMultipleAccountsInfo(keys));
    const result = accountInfos.reduce((acc, accountInfo, index) => {
      if (accountInfo) {
        acc[publicKeys[index]] = accountInfo.lamports;
      } else {
        this.logger.warn(`No account info for key: ${publicKeys[index]}`);
      }
      return acc;
    }, {} as Record<string, number>);

    this.logger.debug(`Fetched balances for keys: ${JSON.stringify(publicKeys)}`);
    this.logger.debug(`Account balances: ${JSON.stringify(result)}`);
    return result;
  }

  async validateSolanaTokenAddress(address: string): Promise<ValidationResult<string>> {
    try {
      return { value: new PublicKey(address).toString(), errorMessage: null };
    } catch (error) {
      this.logger.error(`Error validating Solana token address: ${error.message}`);
      return { value: null, errorMessage: this.i18n.translate('i18n.error_messages.solana_wallet_input_error') };
    }
  }

  generateSolanaWallet() {
    const keypair = Keypair.generate();
    return { publicKey: keypair.publicKey.toBase58(), secretKey: bs58.encode(keypair.secretKey) };
  }

  async getSolBalance(publicKey: string): Promise<number> {
    return await this.connection.getBalance(new PublicKey(publicKey));
  }

  async getTokenBalance(tokenAccountAddress: PublicKey): Promise<number> {
    const response = await this.connection.getTokenAccountBalance(tokenAccountAddress);
    return Number(response.value.amount);
  }

  async getUSDCBalance(userPublicKey: string): Promise<number> {
    this.requestCount++;
    this.logger.log(`Request getUSDCBalance count: ${this.requestCount}`);
    try {
      const userWalletAddress = new PublicKey(userPublicKey);
      const tokenMintAddress = new PublicKey(constants.solana.tokens.usdc_token_address);

      const tokenAccounts = await this.connection.getTokenAccountsByOwner(userWalletAddress, {
        mint: tokenMintAddress,
      });

      if (!tokenAccounts.value || tokenAccounts.value.length === 0) {
        this.logger.warn(`No USDC token account found for user: ${userPublicKey}`);
        return 0;
      }

      const usdcAccount = tokenAccounts.value[0]?.pubkey;
      if (!usdcAccount) {
        this.logger.error(`Failed to retrieve USDC account pubkey for user: ${userPublicKey}`);
        return 0;
      }

      const response = await this.connection.getTokenAccountBalance(usdcAccount);
      return this.utilsService.lamportsToUsdc(Number(response.value.amount));
    } catch (error) {
      this.logger.error(`Failed to get USDC balance for user ${userPublicKey}: ${error.message}`);
      return 0;
    }
  }

  async getTokenBalanceByWalletAddress(tokenAddress: string, walletAddress: string): Promise<number> {
    this.requestCount++;
    this.logger.log(`Request count for solscan: ${this.requestCount}`);

    const tokenMintAddress = new PublicKey(tokenAddress);
    const userWalletAddress = new PublicKey(walletAddress);

    try {
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(userWalletAddress, { mint: tokenMintAddress });

      if (!tokenAccounts.value?.length) {
        return 0;
      }

      const tokenAccount = tokenAccounts.value[0].pubkey;
      const balanceResponse = await this.connection.getTokenAccountBalance(tokenAccount);

      return Number(balanceResponse.value.amount);
    } catch (error) {
      this.logger.error(`Failed to fetch token balance. Error: ${error}`);
      return 0;
    }
  }

  async sendSolToRewardsWalletForMev(fromPubkey: string, lamportsToSend: number): Promise<TransactionInstruction> {
    const toPublicKey = this.rewardsPublicKey;
    return this.createNativeTokenTransferTransaction(new PublicKey(fromPubkey), new PublicKey(toPublicKey), lamportsToSend);
  }

  async sendSolToReferralWalletForMev(fromPubkey: string, toPublicKey: string, lamportsToSend: number): Promise<TransactionInstruction> {
    return this.createNativeTokenTransferTransaction(new PublicKey(fromPubkey), new PublicKey(toPublicKey), lamportsToSend);
  }
  
  async sendSolFromRewardsWallet(toPublicKey: string, lamportsToSend: number): Promise<string> {
    const fromSecretKey = this.rewardsPrivateKey;
    return this.sendSolWithKey(fromSecretKey, toPublicKey, lamportsToSend);
  }

  async sendSolToRewardsWallet(fromSecretKey: string, lamportsToSend: number): Promise<string> {
    const toPublicKey = this.rewardsPublicKey;
    return this.sendSolWithKey(fromSecretKey, toPublicKey, lamportsToSend);
  }

  async sendSolToReferralWallet(fromSecretKey: string, toPublicKey: string, lamportsToSend: number): Promise<string> {
    return this.sendSolWithKey(fromSecretKey, toPublicKey, lamportsToSend);
  }

  async sendSolWithKey(fromSecretKey, toPublicKey: string, lamportsToSend: number): Promise<string> {
    const fromKeypair = this.keypairFromSecretKeyString(fromSecretKey);
    const toPubkey = new PublicKey(toPublicKey);

    const transferTransaction = new Transaction()
      .add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPubkey,
          lamports: lamportsToSend,
        }),
      );

    return await sendAndConfirmTransaction(
      this.connection,
      transferTransaction,
      [fromKeypair],
      { skipPreflight: true });
  }

  async sendUsdcFromRewardsWallet(toPublicKey: string, usdcToSend: number): Promise<string> {
    const fromSecretKey = this.rewardsPrivateKey;
    const usdcInLamports = usdcToSend / 1000;
    return this.sendUSDCWithKey(fromSecretKey, toPublicKey, usdcInLamports);
  }

  async createVersionedTransaction (payer: Keypair[], instructions: TransactionInstruction[], latestBlockhash: Readonly<LatestBlockhash>): Promise<VersionedTransaction> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.getRecentBlockhash();
      const message = new TransactionMessage({
          payerKey: payer[0].publicKey,
          recentBlockhash: blockhash,
          instructions,
      }).compileToV0Message();

      const tx = new VersionedTransaction(message);
      tx.sign(payer);
      return tx;
    } catch (error) {
        console.error('Error in createVersionedTransaction:', error);
        throw new Error('Failed to create transaction');
    }
  }
  
  async createNativeTokenTransferTransaction(
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL)
    })
  }

  async sendSwapTransaction(payer: Keypair[], jitoTransactions: VersionedTransaction[]): Promise<String> {
    try {
      // Start by extracting instructions and recent blockhash from the first transaction
      let mergedInstructions = [];
      let recentBlockhash = jitoTransactions[0].message.recentBlockhash;
      let accountKeys = jitoTransactions[0].message.staticAccountKeys;
      let signatures = [];

      // Merge instructions and account keys from all transactions
      jitoTransactions.forEach((tx) => {
        mergedInstructions.push(...tx.message.compiledInstructions); // Merge instructions
        signatures.push(...tx.signatures); // Collect signatures
        accountKeys.push(...tx.message.staticAccountKeys); // Merge account keys

        // Use the most recent blockhash from the last transaction
        recentBlockhash = tx.message.recentBlockhash;
      });
      // Create a new message with merged instructions and the latest blockhash
      const mergedMessage = new MessageV0({
        header: jitoTransactions[0].message.header, // Use header from the first transaction
        staticAccountKeys: [...new Set(accountKeys)], // Ensure no duplicate account keys
        recentBlockhash, // Use the most recent blockhash
        compiledInstructions: mergedInstructions, // Add merged instructions
        addressTableLookups: [], // Include address table lookups if needed
      });

      // Sign the new merged transaction with the combined signatures
      const mergedTransaction = new VersionedTransaction(mergedMessage);
      mergedTransaction.signatures = signatures;
      const signature = bs58.encode(mergedTransaction.signatures[0]);
      const serializedTransactions = bs58.encode(mergedTransaction.serialize());
      
      const confirmTransaction = await this.sendTransactionWithJito([serializedTransactions],signature);
      if(!confirmTransaction.confirmed){
        this.logger.error('Something went wrong while confirming on Jito.Please try again.');
      }
      return signature;
    } catch (error) {
      this.logger.error(`Error in createVersionedTransaction: `, error);
      throw new Error('Failed to create transaction');
    }
  }

  async getOrCreateTokenAccount(payer: Keypair, token: string, userWallet: string): Promise<PublicKey> {
    this.requestCount++;
    this.logger.log(`Request getOrCreateTokenAccount count: ${this.requestCount}`);
    const tokenMintAddress = new PublicKey(token);
    const userWalletAddress = new PublicKey(userWallet);

    try {
      const existingAccount = await this.findTokenAccount(userWalletAddress, tokenMintAddress);
      if (existingAccount) {
        this.logger.log(`Found existing token account: ${existingAccount.toBase58()}`);
        return existingAccount;
      }

      this.logger.log(`Token account not found. Creating new token account for token: ${tokenMintAddress.toBase58()}, user: ${userWalletAddress.toBase58()}`);
      const newAccount = await this.createTokenAccount(payer, tokenMintAddress, userWalletAddress);

      this.logger.log(`Created new token account: ${newAccount.toBase58()}`);
      return newAccount;
    } catch (error) {
      this.logger.error(`Error in getOrCreateTokenAccount: ${error.message}`, error.stack);
      throw new Error(`Failed to get or create token account: ${error.message}`);
    }
  }

  private sendTransactionWithJito = async (serializedTransactions: string[], trxHash: string) => {
    const endpoints = [
        'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
        'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
        'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
        'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
        'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
    ];
    const { blockhash, lastValidBlockHeight } = await this.getRecentBlockhash();

    const requests = endpoints.map((url) =>
        axios.post(url, {
            jsonrpc: '2.0',
            id: 1,
            method: 'sendBundle',
            params: [serializedTransactions],
        }),
    );
    this.logger.log('Sending transactions to endpoints...');

    const results = await Promise.all(requests.map((p) => p.catch((e) => e)));
    const successfulResults = results.filter((result) => !(result instanceof Error));

    if (successfulResults.length > 0) {
      this.logger.log('At least one successful response');
      this.logger.log('Confirming jito transaction...');
      await this.connection.confirmTransaction(
        {
          signature: trxHash,
          lastValidBlockHeight: lastValidBlockHeight,
          blockhash: blockhash,
        },
        this.connection.commitment,
      );
    } else {
      this.logger.error('No successful responses received for jito');
    }
    return { confirmed: false };
  }

  private async createTokenAccount(
    payer: Keypair,
    tokenMintAddress: PublicKey,
    userWalletAddress: PublicKey,
  ): Promise<PublicKey> {
    this.logger.log(`Attempting to create token account for token: ${tokenMintAddress.toBase58()}, user: ${userWalletAddress.toBase58()}`);

    try {
      const account = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        tokenMintAddress,
        userWalletAddress,
        false,
        'confirmed',
      );

      this.logger.log(`Token account creation response received: ${account.address.toBase58()}`);
      return account.address;
    } catch (error) {
      this.logger.error(`Error during token account creation: ${error.message}`, error.stack);

      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        this.logger.warn(`Token account already exists or conflicts: ${error.message}`);
        try {
          const accountAddress = getAssociatedTokenAddressSync(tokenMintAddress, userWalletAddress, false);
          const existingAccount = await getAccount(this.connection, accountAddress);
          this.logger.log(`Existing token account retrieved: ${existingAccount.address.toBase58()}`);
          return existingAccount.address;
        } catch (e) {
          this.logger.error(`Failed to retrieve already existing account: ${e.message}`, e.stack);
          throw new Error(`Failed to retrieve or create token account: ${e.message}`);
        }
      }

      throw new Error(`Failed to create token account: ${error.message}`);
    }
  }

  async getOrCreateUSDCAccount(payer: Keypair, userWallet: string): Promise<PublicKey> {
    const usdcMintAddress = new PublicKey(constants.solana.tokens.usdc_token_address);
    return await this.getOrCreateTokenAccount(payer, usdcMintAddress.toBase58(), userWallet);
  }

  private async findTokenAccount(userWalletAddress: PublicKey, tokenMintAddress: PublicKey): Promise<PublicKey | null> {
    try {
      const accounts = await this.connection.getTokenAccountsByOwner(userWalletAddress, { mint: tokenMintAddress });
      if (accounts.value.length > 0) {
        return accounts.value[0].pubkey;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async checkUserSolBalance(userWallet: string, minBalance: number = 0.01): Promise<boolean> {
    const balanceSolLamports = await this.getSolBalance(userWallet);
    const balanceSol = this.utilsService.lamportsToSol(balanceSolLamports);

    return balanceSol >= minBalance;
  }

  async sendUSDCWithKey(fromSecretKey: string, toPublicKey: string, usdcToSend: number): Promise<string> {
    const fromKeypair = this.keypairFromSecretKeyString(fromSecretKey);
    const usdcToSendInLamports = this.utilsService.usdcToLamports(usdcToSend);

    const fromTokenAccount = await this.getOrCreateTokenAccount(fromKeypair, constants.solana.tokens.usdc_token_address, fromKeypair.publicKey.toBase58());
    const toTokenAccount = await this.getOrCreateTokenAccount(fromKeypair, constants.solana.tokens.usdc_token_address, toPublicKey);

    return await this.transferUSDC(fromKeypair, fromTokenAccount, toTokenAccount, usdcToSendInLamports);
  }

  private async transferUSDC(fromKeypair: Keypair, fromTokenAccount: PublicKey, toTokenAccount: PublicKey, amount: number): Promise<string> {
    const transferInstruction = this.createTransferInstruction(fromTokenAccount, toTokenAccount, fromKeypair.publicKey, amount);
    const { blockhash, lastValidBlockHeight } = await this.getRecentBlockhash();
    const transferTransaction = this.buildTransferTransaction(transferInstruction, blockhash, fromKeypair);
    const signature = await this.sendRawTransaction(transferTransaction);
    await this.confirmTransactionOrFail(signature, blockhash, lastValidBlockHeight);
    return signature;
  }

  private createTransferInstruction(fromTokenAccount: PublicKey, toTokenAccount: PublicKey, publicKey: PublicKey, amount: number): TransactionInstruction {
    return createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID,
    );
  }

  private async getRecentBlockhash(): Promise<{ blockhash: string, lastValidBlockHeight: number }> {
    return await this.connection.getLatestBlockhash();
  }

  private buildTransferTransaction(transferInstruction: TransactionInstruction, blockhash: string, fromKeypair: Keypair): Transaction {
    const transferTransaction = new Transaction().add(transferInstruction);
    transferTransaction.recentBlockhash = blockhash;
    transferTransaction.feePayer = fromKeypair.publicKey;
    transferTransaction.sign(fromKeypair);
    return transferTransaction;
  }

  private async sendRawTransaction(transaction: Transaction): Promise<string> {
    return await this.connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
  }

  private async confirmTransactionOrFail(signature: string, blockhash: string, lastValidBlockHeight: number): Promise<void> {
    const confirmation = await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    } as any, 'confirmed');
    if (confirmation.value.err) {
      throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
    }
  }

  async confirmSwapTransaction(signature: string ): Promise<void> {
    const { blockhash, lastValidBlockHeight } = await this.getRecentBlockhash();

    const confirmation = await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    } as any, 'confirmed');
    if (confirmation.value.err) {
      throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
    }
  }

  keypairFromSecretKeyString(base58PrivateKey: string): Keypair {
    const privateKeyBuffer = bs58.decode(base58PrivateKey);
    const privateKeyUint8Array = new Uint8Array([...privateKeyBuffer]);
    return Keypair.fromSecretKey(privateKeyUint8Array);
  }

  getDeveloperFeePubkey(): PublicKey {
    return new PublicKey(this.feeAccountAddress);
  }

  async buildTransaction(wallet: Wallet, swapTransaction: string): Promise<VersionedTransaction> {
    const message = this.deserializeTransaction(swapTransaction);
    const accountKeysFromLookups = await this.resolveAddressLookups(message);
    const instructions = this.createTransactionInstructions(message, accountKeysFromLookups);
    const compiledMessage = await this.compileMessage(wallet, instructions);

    return new VersionedTransaction(compiledMessage);
  }

  deserializeTransaction (swapTransaction: string): MessageV0 {
    const transactionBuffer = Buffer.from(swapTransaction, 'base64');
    return VersionedTransaction.deserialize(transactionBuffer).message as MessageV0;
  }

  async resolveAddressLookups(message: MessageV0): Promise<{ writable: PublicKey[], readonly: PublicKey[] }> {
    if (!message.addressTableLookups.length) {
      return { writable: [], readonly: [] };
    }

    const lookupTableAccounts = await Promise.all(
      message.addressTableLookups.map(async (lookup, i) => {
        const accountInfo = await this.connection.getAccountInfo(lookup.accountKey);
        if (!accountInfo) {
          throw new Error(`Missing address lookup table account info at index ${i}`);
        }
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(accountInfo.data),
        });
      }),
    );

    return message.resolveAddressTableLookups(lookupTableAccounts);
  }

  createTransactionInstructions(
    message: MessageV0, 
    accountKeysFromLookups: { 
      writable: PublicKey[],
      readonly: PublicKey[]
    }
  ): TransactionInstruction[] {
    const accountKeys = message.getAccountKeys({ accountKeysFromLookups });

    return message.compiledInstructions.map(({ accountKeyIndexes, programIdIndex, data }) => {
      const keys = accountKeyIndexes.map(index => ({
        pubkey: accountKeys.get(index),
        isSigner: message.isAccountSigner(index),
        isWritable: message.isAccountWritable(index),
      }));

      return new TransactionInstruction({ keys, programId: accountKeys.get(programIdIndex), data: Buffer.from(data) });
    });
  }

  private async compileMessage(wallet: Wallet, instructions: TransactionInstruction[]): Promise<MessageV0> {
    const recentBlock = await this.connection.getLatestBlockhash();
    return new TransactionMessage({
      payerKey: wallet.publicKey,
      instructions,
      recentBlockhash: recentBlock.blockhash,
    }).compileToV0Message();
  }

  async getTokenMetadata(tokenAddress: string): Promise<Metadata> {
    return this.tokenMetadataService.fetchTokenMetadata(tokenAddress);
  }

  async getUsersTokenAddresses(walletAddress: string): Promise<{ mintAddress: string; balance: number }[]> {
    const tokenAccounts = await this.fetchTokenAccounts(walletAddress);
    const tokenAddresses = await Promise.all(
      tokenAccounts.value.map((tokenAccount) => this.extractTokenInfo(tokenAccount)),
    );

    return this.filterNonZeroBalances(tokenAddresses);
  }

  private async extractTokenInfo(tokenAccount: { account: { data: Buffer } }): Promise<{
    mintAddress: string;
    balance: number;
  } | null> {
    ``;
    const accountInfo = AccountLayout.decode(tokenAccount.account.data);
    const mintAddress = new PublicKey(accountInfo.mint).toString();
    const balance = Number(accountInfo.amount);

    if (balance === 0) {
      return null;
    } else {
      const decimals = await this.getMintDecimals(mintAddress);
      const adjustedBalance = balance / Math.pow(10, decimals);
      this.logger.debug(`mintAddress: ${mintAddress}, balance: ${adjustedBalance}`);
      return { mintAddress, balance: adjustedBalance };
    }
  }

  private filterNonZeroBalances(tokenAddresses: ({ mintAddress: string; balance: number } | null)[]) {
    return tokenAddresses.filter(token => token !== null); // Filter out null values
  }

  private async getMintDecimals(mintAddress: string): Promise<number> {
    try {
      const mintInfo = await getMint(this.connection, new PublicKey(mintAddress));
      return mintInfo?.decimals || 0;
    } catch (error) {
      if (error.message.includes('429')) {
        this.logger.warn('Rate limit hit, retrying...');
        await this.delay(4000); // Wait 4 seconds
        return this.getMintDecimals(mintAddress);
      }
      this.logger.error(`Error fetching mint info for ${mintAddress}:`, error);
      return 0;
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  private async fetchTokenAccounts(walletAddress: string) {
    return this.connection.getTokenAccountsByOwner(
      new PublicKey(walletAddress),
      {
        programId: TOKEN_PROGRAM_ID,
      },
    );
  }

  createTransactionDetails(
    transactionHash: string,
    from: string,
    to: string,
    transactionType: string,
    amountTokens: number,
    amountSOL: number,
  ) {
    return {
      transactionHash,
      from,
      to,
      amountTokens: amountTokens.toString(),
      amountSOL: amountSOL.toFixed(6).toString(),
      transactionType,
      solscanUrl: `https://solscan.io/tx/${transactionHash}`,
    };
  }
}
