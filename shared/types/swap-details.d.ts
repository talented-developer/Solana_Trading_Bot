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
    direction?: Direction;
}
export declare enum Direction {
    BUY = "buy",
    SELL = "sell"
}
