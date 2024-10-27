export interface NotificationDto {
  timestamp?: number;
  tokenAddress: string;
  tokenSymbol?: string;
  tokenPair?: TokenPair;
  type?: NotificationType;
  body?: unknown;
}

export interface TokenPair {
  coin: string;
  pc: string;
  pairAddress: string;
}

export enum NotificationType {
  RAYDIUM_TOKEN_LAUNCH = 'token_launch',
  VOLUME_SPIKE = 'volume_spike',
  NEW_CALL = 'new_call',
  LARGE_BUY = 'large_buy',
  LARGE_SELL = 'large_sell',
}

export enum TokenFilterType {
  MarketNameFilter = 'Raydium',
  IsMutable = 'isMutable',
  LiquidityLock = 'liquidityLock',
  DevWalletValue = 'devWalletValue',
  FreezeAuthority = 'freezeAuthority',
  VolumeBuySpike = 'volumeBuySpike',
  VolumeSellSpike = 'volumeSellSpike',
  NumberOfHolders = 'numberOfHolders',
  ScoreFilter = 'scoreFilter',
  MinLiquidityFilter = 'minLiquidityFilter',
  MintFilter = 'mintFilter',
  LiquidityRatio = 'liquidityRatio',
  BuyVolumeCount = 'buyVolumeCount',
  PriceChange = 'priceChange',
  PriceChangePositive = 'priceChangePositive',
}

export interface VolumeSpikeNotification {
  volume: number;
  buyVolume: number;
  sellVolume: number;
  profit: number;
  duration: number;
  priceChangePercentage: number;
}

export interface BuyTrendNotification {
  trend: number;
  gradient: number;
  duration: number;
}

export interface SellTrendNotification {
  trend: number;
  gradient: number;
  duration: number;
}

export interface WhaleBuyNotification {
  amount: number;
  priceChangePercentage: number;
  walletAddress: string;
}

export interface LargeSellNotification {
  amount: number;
  priceChangePercentage: number;
  walletAddress: string;
}

export interface LargeBuyNotification {
  amount: number;
  priceChangePercentage: number;
  walletAddress: string;
}
