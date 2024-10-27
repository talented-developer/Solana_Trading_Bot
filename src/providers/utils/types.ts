import { Blockhash, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';

// Define the interface for the user settings
interface UserSettings {
  id: number;
  userId: number;
  minBuy: number;
  mevProtection: boolean;
  slippage: number;
  maxGasPrice: number;
  priorityFee: number;
  withdrawWallet: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the user
export interface User {
  id: number;
  telegramId: bigint;
  walletAddress: string;
  refLink: string;
  inviterId: number | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  Settings: UserSettings;
}

// Define the interface for trade details
interface TradeDetails {
  token_image: string;
  token_name: string;
  market_name: string;
  token_address: string;
  token_symbol: string;
  market_cap: string;
  token_age: string;
  top_10_holders: string;
  creator_percentage: string;
  number_holders: string;
  liquidity_lock_percentage: number;
  liquidity: string;
  liquidityRatio: string;
  supply: string;
  price_change_5min: string;
  price_trend: string;
  price_change_1hr: string;
  price_change_24hr: string;
  ath: string;
  volume_5min: string;
  volume_1hr: string;
  volume_24hr: string;
  mint_authority: string;
  is_mutable: string;
  freeze_status: string;
  x_com_link: string;
  telegram: string;
  website: string;
  dexscreen: string;
}

export interface TransactionContext {
  user: User;
  wallet: Wallet;
  tradeDetails: TradeDetails;
  inputTokenAddress: string,
  outputTokenAddress: string,
  adjustedAmountLamports: number,
  priorityFeeLamports: number,
  developerFeeLamports: number,
  referralFeeLamports: number,
  referralWalletAddress: string | undefined,
  transactionType: string,
  fromSecretKey: string
}

export interface SendTransactionResponse {
  confirmed: boolean;
  signature?: string;
}

export interface LatestBlockhash {
    blockhash: Blockhash;
    lastValidBlockHeight: number;
}