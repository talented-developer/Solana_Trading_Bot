export interface PnL {
    investedUsd: number;
    profitUsd: number;
    investedSol: number;
    profitSol: number;
    profitPercentage: number;
    gainLoss: number;
    percentageGainLoss: number;
    winRate: number;
}
export interface PriceChange {
    priceChangeSol: number;
    priceChangeUSD: number;
    percentageChange: number;
}
export interface PricePnLSummary {
    priceChange: PriceChange;
    pnl: PnL;
    startTime: number;
    endTime: number;
    duration: number;
}
export interface PricePnLSeries {
    five_minutes: PricePnLSummary;
    one_hour: PricePnLSummary;
    six_hours: PricePnLSummary;
    one_day: PricePnLSummary;
}
