export interface MarketDataResponse {
  pairs: PairData[];
}

interface PairData {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: TokenData;
  quoteToken: TokenData;
  priceNative: string;
  priceUsd: string;
  txns: TransactionData;
  volume: VolumeData;
  priceChange: PriceChangeData;
  liquidity: LiquidityData;
  fdv: number | string;
  pairCreatedAt: number;
  info: InfoData;
}

interface TokenData {
  address: string;
  name: string;
  symbol: string;
}

interface TransactionData {
  m5: TransactionDetails;
  h1: TransactionDetails;
  h6: TransactionDetails;
  h24: TransactionDetails;
}

interface TransactionDetails {
  buys: number;
  sells: number;
}

interface VolumeData {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface PriceChangeData {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface LiquidityData {
  usd: number | string;
  base: number;
  quote: number;
}

interface InfoData {
  imageUrl: string;
  websites: WebsiteData[];
  socials: SocialData[];
}

interface WebsiteData {
  label: string;
  url: string;
}

interface SocialData {
  type: string;
  url: string;
}


// dexScreener /tokens/ endpoint types
export interface TokenResponse {
  schemaVersion: string;
  pairs: Pair[];
}

export interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  priceNative: string;
  priceUsd?: string;
  txns: Transactions;
  volume: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: PairInfo;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

export interface Transactions {
  m5: Txns;
  h1: Txns;
  h6: Txns;
  h24: Txns;
}

export interface Txns {
  buys: number;
  sells: number;
}

export interface Volume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

export interface PriceChange {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

export interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface PairInfo {
  imageUrl?: string;
  websites?: Website[];
  socials?: Social[];
}

export interface Website {
  label: string;
  url: string;
}

export interface Social {
  type: string;
  url: string;
}