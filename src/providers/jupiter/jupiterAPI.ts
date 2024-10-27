import axios, { AxiosInstance } from 'axios';
import { Wallet } from '@coral-xyz/anchor';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JupiterAPI {
  private readonly logger = new Logger(this.constructor.name);
  private readonly jupiterApi: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseUrl = this.configService.get<string>('blockchain.jupiter.baseUrl');
    this.jupiterApi = axios.create({ baseURL: baseUrl });
  }

  /**
   * Fetches a quote for swapping tokens.
   * @param {string} inputMint - The mint address of the input token.
   * @param {string} outputMint - The mint address of the output token.
   * @param {number} amount - The amount of input tokens to swap.
   * @param {number} slippageBps - The slippage tolerance in basis points.
   * @param {number} platformFeeBps - The platform fee in basis points.
   * @returns {Promise<any>} The fetched quote data.
   * @throws {Error} If the quote fetching fails.
   */
  async fetchQuote(inputMint: string, outputMint: string, amount: number, slippageBps: number, platformFeeBps?: number): Promise<any> {
    this.logger.debug(`Fetching quote: inputMint=${inputMint}, outputMint=${outputMint}, amount=${amount}, slippageBps=${slippageBps}, platformFeeBps=${platformFeeBps}`);

    // Create the params object with mandatory parameters
    const params: Record<string, any> = {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      onlyDirectRoutes: true,
    };

    // Conditionally add platformFeeBps if it's provided
    if (platformFeeBps !== undefined) {
        params.platformFeeBps = platformFeeBps;
    }
    
    try {
      const response = await this.jupiterApi.get('quote', { params });

      if (!response.data) {
        this.logger.error(`Failed to fetch quote: ${response.statusText}`);
        throw new Error(`Failed to fetch quote: ${response.statusText}`);
      }

      this.logger.debug(`Fetched quote: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching quote: ${error.message}`);
      throw new Error(`Error fetching quote: ${error.message}`);
    }
  }

  /**
   * Creates a swap transaction.
   * @param {Wallet} wallet - The wallet instance.
   * @param {any} quote - The quote data for the swap.
   * @param priorityFeeLamports - The priority fee lamport for transaction. Optional priority fee for normal swap
   * @param jitoTipLamports - The priority fee lamport for transaction. Optional Jito tip fee for Jito swap
   * @returns {Promise<any>} The created swap transaction data.
   * @throws {Error} If the swap transaction creation fails.
   */

  async createSwapTransaction( wallet: Wallet, quote: any, priorityFeeLamports?: number, jitoTipLamports?: number): Promise<any> {
    const baseUrl = this.configService.get('blockchain.jupiter.baseUrl');

    // Base request body
    const requestBody: any = {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toBase58(),
      dynamicComputeUnitLimit: true,
    };

    // Conditionally add prioritization fees
    requestBody.prioritizationFeeLamports = priorityFeeLamports !== undefined ? priorityFeeLamports : { jitoTipLamports };

    // Make the POST request
    const response = await axios.post(`${baseUrl}/swap`, requestBody);

    // Handle response validation
    if (!response.data || !response.data.swapTransaction) {
        throw new Error(`Failed to fetch swap transaction: ${response.statusText}`);
    }

    return response.data;
  }
}