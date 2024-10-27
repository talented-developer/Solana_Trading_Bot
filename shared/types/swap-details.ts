export interface SwapTokenDTO {
  tokenAddress: string;
  amount: number;
  symbol: string;
  decimals?: number;
}

export interface SwapDetailsDTO {
  signatures: string[];
  signers: string[];
  buyToken?: SwapTokenDTO;
  sellToken?: SwapTokenDTO;
  timestamp?: number;
  timestampISO?: string;
  recipient?: string;
  confirmationStatus?: string;
  direction?: Direction; // 'buy' | 'sell'
}

export enum Direction {
  BUY = 'buy',
  SELL = 'sell',
}
