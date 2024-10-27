import { Connection, Keypair, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { Injectable, Logger } from '@nestjs/common';
import { Wallet } from '@coral-xyz/anchor';
import * as bs58 from 'bs58';
import { JupiterAPI } from './jupiterAPI';
import axios, { AxiosError } from 'axios';
import { SolanaService } from '../solana/solana.service';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import { UtilsService } from '../../telegram/service/utils/utils.service';

interface TokenData {
  price?: number;
}

interface ApiResponse {
  data: Record<string, TokenData>;
}

@Injectable()
export class JupiterService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly feeAccountAddress: string;
  private readonly solanaUSDCAddress: string;
  private readonly solanaInvoiceWalletAddress: string;
  private readonly connection: Connection;
  private readonly baseUrl: string;
  private pricesCache: Record<string, number> = {};

  constructor(
    private readonly jupiterAPI: JupiterAPI,
    private readonly solanaService: SolanaService,
    private readonly utilsService: UtilsService,
    private configService: ConfigService,
  ) {
    this.feeAccountAddress = this.solanaService.getDeveloperFeePubkey().toBase58();
    // this.feeAccountAddress = "HBEF67CeNU5beezwb11q53X2aynBh1YizQQLyGBUfZQ8";
    this.solanaUSDCAddress = this.configService.get('blockchain.solana.usdcAddressSolanaChain');
    this.solanaInvoiceWalletAddress = this.configService.get('blockchain.solana.solanaInvoiceWalletAddress');
    const heliusRpcUrl = this.configService.get('blockchain.solana.rpcUrl');
    this.baseUrl = this.configService.get('blockchain.jupiter.baseUrl');
    this.connection = new Connection(heliusRpcUrl, { commitment: 'confirmed' });
  }

  createWallet(userPrivateKey: string): Wallet {
    const secretKeyBuffer = bs58.decode(userPrivateKey);
    const secretKeyUint8Array = new Uint8Array([...secretKeyBuffer]);
    return new Wallet(Keypair.fromSecretKey(secretKeyUint8Array));
  }

  async getSolPriceInUsdc(): Promise<number> {
    const priceUrl = this.configService.get('blockchain.jupiter.priceUrl');
    try {
      const response = await axios.get(`${priceUrl}/price?ids=So11111111111111111111111111111111111111112`);
      if (response.status === 200) {
        const solData = response.data.data['So11111111111111111111111111111111111111112'];
        if (solData && solData.price) {
          return solData.price;
        } else {
          return null;
        }
      } else {
        this.logger.error(`Error retrieving SOL price: ${response.status}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      return null;
    }
  }


  async getUSDSolPrice(solAmount): Promise<number> {
    const solPriceInUsdc = await this.getSolPriceInUsdc();

    return solAmount * solPriceInUsdc;
  }

  async sendSwapTransaction(
    wallet: Wallet,
    inputTokenAddress: string,
    outputTokenAddress: string,
    amountLamports: number,
    slippageBps: number,
    priorityFeeLamports: number,
  ): Promise<{
    amountTokens: string;
    amountSol: string;
    swapTransaction: VersionedTransaction;
    txid: string;
  }> {

    const quote = await this.jupiterAPI.fetchQuote(inputTokenAddress, outputTokenAddress, amountLamports, slippageBps, 100);
    if (!quote || !quote.routePlan?.[0]?.swapInfo) {
      throw new Error('Failed to fetch a valid swap quote.');
    }
    
    const swapObj = await this.jupiterAPI.createSwapTransaction(wallet, quote, priorityFeeLamports);
    if (!swapObj?.swapTransaction) {
      throw new Error('Failed to create a valid swap transaction.');
    }

    const transaction: VersionedTransaction = await this.solanaService.buildTransaction(wallet, swapObj.swapTransaction);
    const signedTransaction = await wallet.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();

    // Sending transaction with skipPreflight set to true
    const txid = await this.connection.sendRawTransaction(rawTransaction, { skipPreflight: true });
    this.logger.debug(`Transaction sent: ${txid}`);
    this.logger.debug(`Transaction URL: https://solscan.io/tx/${txid}`);

    return {
      amountTokens: quote.routePlan[0].swapInfo.outAmount,
      amountSol: (amountLamports / LAMPORTS_PER_SOL).toString(),
      swapTransaction: transaction,
      txid,
    };
  }

  async getQuote(inputMint: string, outputMint: string, amountLamports: number, slippageBps: number) {
    const quoteUrl = `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`;
    const quoteResponse = await axios.get(quoteUrl);
    return quoteResponse.data;
  }

  async getSwapJupiterTransaction(wallet: Wallet, quoteResponse: any): Promise<VersionedTransaction> {
    const swapUrl = 'https://quote-api.jup.ag/v6/swap';

    try {
      const swapResponse = await axios.post(swapUrl, {
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
        quoteResponse,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 120000,
      });

      if (!swapResponse.data?.swapTransaction) {
        throw new Error('Invalid swap response or missing swapTransaction');
      }

      const swapTransactionBuf = Buffer.from(swapResponse.data.swapTransaction, 'base64');
      const transactionMessage = VersionedTransaction.deserialize(swapTransactionBuf);

      // Check if the transaction needs a signature from the payer
      transactionMessage.sign([wallet.payer]);

      return transactionMessage;
    } catch (error) {
      console.error('Failed to create swap transaction:', error);
      throw new Error('Failed to get or sign the swap transaction');
    }
  }

  async fetchPrices(associatedAccounts: {
    address: string;
    balance: number;
    decimals: number;
  }[]): Promise<Record<string, TokenData>> {
    if (!Array.isArray(associatedAccounts) || associatedAccounts.length === 0) {
      return {};
    }

    const maxAddresses = 100;
    const results: Record<string, TokenData> = {};
    const addressesBatch: string[] = [];

    for (const account of associatedAccounts.slice(0, maxAddresses)) {
      addressesBatch.push(account.address);
      if (addressesBatch.length === maxAddresses) {
        const prices = await this.fetchPriceBatch(addressesBatch);
        Object.assign(results, prices);
        addressesBatch.length = 0;
      }
    }

    if (addressesBatch.length > 0) {
      const prices = await this.fetchPriceBatch(addressesBatch);
      Object.assign(results, prices);
    }

    return results;
  }

  private async fetchPriceBatch(addresses: string[]): Promise<Record<string, TokenData>> {
    const priceUrl = this.configService.get('blockchain.jupiter.priceUrl');
    const url = `${priceUrl}/price?ids=${addresses.join(',')}`;
    this.logger.log(`Request URL: ${url}`);
    const maxRetries = 5;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const response = await axios.get(url);
        return response.data.data; // Adjust based on your response structure
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 429) {
          attempts++;
          const waitTime = Math.pow(2, attempts) * 100; // Exponential backoff
          this.logger.warn(`Rate limit exceeded. Retrying in ${waitTime} ms...`);
          await this.utilsService.delay(waitTime);
        } else {
          this.logger.error(`Error fetching prices: ${error.message}`);
          return {};
        }
      }
    }

    this.logger.error('Max retries reached. Unable to fetch prices.');
    return {};
  }
}