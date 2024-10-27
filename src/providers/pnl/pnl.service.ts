import { Injectable, Logger } from '@nestjs/common';
import { PnL, PriceChange, PricePnLSeries, PricePnLSummary } from '@shared/types/pnl';
import { SwapDetailsDTO, SwapTokenDTO } from '@shared/types/swap-details';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PublicKey } from '@solana/web3.js';
import { SolscanService, SwapDetailsParams } from '../solscan/solscan.service';
import { SwapService } from '../../telegram/service/swap/swap.service';
import constants from '@shared/constants';
import { JupiterService } from '../jupiter/jupiter.service';
import { UtilsService } from '../../telegram/service/utils/utils.service';

@Injectable()
export class PnlService {
  private readonly logger = new Logger(this.constructor.name);
  private solscanService: SolscanService;

  private emptyPricePnLSummary = {
    pnl: {
      investedUsd: 0,
      profitUsd: 0,
      investedSol: 0,
      profitSol: 0,
      profitPercentage: 0,
      gainLoss: 0,
      percentageGainLoss: 0,
      winRate: 0,
    },
    priceChange: { priceChangeSol: 0, priceChangeUSD: 0, percentageChange: 0 },
    startTime: 0,
    endTime: 0,
    duration: 0,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly swapService: SwapService,
    private readonly jupiterService: JupiterService,
    private readonly utilsService: UtilsService,
  ) {
    this.solscanService = new SolscanService(configService, httpService);
  }

  getWinRate(swapHistory: SwapDetailsDTO[]): number {
    const tradePairs = new Map<string, { buys: SwapDetailsDTO[], sells: SwapDetailsDTO[] }>();

    for (const swap of swapHistory) {
      const owner = swap.recipient;
      if (!owner) continue;

      const tokenSymbol =
        this.isSolToken(swap.buyToken) && swap.buyToken ? swap.buyToken.symbol :
          this.isSolToken(swap.sellToken) && swap.sellToken ? swap.sellToken.symbol :
            undefined;

      if (!tokenSymbol) continue;

      const key = `${owner}-${tokenSymbol}`;
      if (!tradePairs.has(key)) {
        tradePairs.set(key, { buys: [], sells: [] });
      }

      const trades = tradePairs.get(key)!;
      if (this.isSolToken(swap.buyToken)) {
        trades.buys.push(swap);
      } else if (this.isSolToken(swap.sellToken)) {
        trades.sells.push(swap);
      }
    }

    let winningTrades = 0;
    let totalTrades = 0;

    for (const trades of tradePairs.values()) {
      const { buys, sells } = trades;
      const pairsCount = Math.min(buys.length, sells.length);

      for (let i = 0; i < pairsCount; i++) {
        totalTrades++;
        if (sells[i].sellToken!.amount > buys[i].buyToken!.amount) {
          winningTrades++;
        }
      }
    }

    return totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  }

  isSolToken(swapToken: SwapTokenDTO) {
    return swapToken && (swapToken.symbol === 'SOL' || swapToken.tokenAddress === 'So11111111111111111111111111111111111111112');
  }

  async getPnLFromSwapHistory(swapHistory: SwapDetailsDTO[]): Promise<PnL> {
    let totalSolSold = 0;
    let totalSolBoughtInLamports = 0;

    swapHistory.forEach((swap) => {
      if (this.isSolToken(swap.sellToken)) {
        totalSolSold += swap.sellToken.amount;
      }
      if (this.isSolToken(swap.buyToken)) {
        totalSolBoughtInLamports += swap.buyToken.amount;
      }
    });

    // Convert lamports to SOL
    const investedSol = this.utilsService.lamportsToSol(totalSolBoughtInLamports);
    const solUsdPrice = await this.jupiterService.getSolPriceInUsdc();
    const investedUsd = investedSol * solUsdPrice;
    const totalSolSoldInSol = this.utilsService.lamportsToSol(totalSolSold);
    const profitSol = totalSolSoldInSol - investedSol;
    const profitUsd = profitSol * solUsdPrice;
    const profitPercentage = investedSol > 0 ? (profitSol / investedSol) * 100 : 0;
    const gainLoss = investedSol > 0 ? totalSolSoldInSol / investedSol : 0;
    const percentageGainLoss = investedSol > 0 ? (gainLoss - 1) * 100 : 0;
    const winRate = this.getWinRate(swapHistory);

    return {
      investedUsd,
      profitUsd,
      investedSol,
      profitSol,
      profitPercentage,
      gainLoss,
      percentageGainLoss,
      winRate,
    };
  }

  async getPriceChangeFromSwapHistory(swapHistory: SwapDetailsDTO[]): Promise<PriceChange> {
    const sortedSwapHistory = swapHistory.filter(swap => swap.buyToken.symbol != 'SOL').sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
    const firstBuySwap = sortedSwapHistory[0];
    const lastBuySwap = sortedSwapHistory[sortedSwapHistory.length - 1];
    const initialBuyPrice = firstBuySwap.sellToken.amount / lastBuySwap.buyToken.amount;
    const finalBuyPrice = lastBuySwap.sellToken.amount / lastBuySwap.buyToken.amount;
    const priceChangeSol = finalBuyPrice - initialBuyPrice;
    const priceChangeUSD = await this.jupiterService.getUSDSolPrice(priceChangeSol);
    const percentageChange = (priceChangeSol / initialBuyPrice) * 100;

    return {
      priceChangeSol,
      priceChangeUSD,
      percentageChange,
    };
  }

  getTimeDetailsFromSwapHistory(swapHistory: SwapDetailsDTO[]): any {
    if (swapHistory.length == 0) {
      return { startTime: null, endTime: null, duration: null };
    }
    const startTime = swapHistory[swapHistory.length - 1].timestamp;
    const endTime = swapHistory[0].timestamp;
    const duration = endTime - startTime;

    return { startTime, endTime, duration };
  }

  async getPricePnLSummaryFromSwapHistory(swapHistory: SwapDetailsDTO[]): Promise<PricePnLSummary> {

    if (swapHistory.length === 0) {
      this.logger.warn(`No swap history found for wallet address`);
      return {
        pnl: {
          investedUsd: 0,
          profitUsd: 0,
          investedSol: 0,
          profitSol: 0,
          profitPercentage: 0,
          gainLoss: 0,
          percentageGainLoss: 0,
          winRate: 0,
        },
        priceChange: { priceChangeSol: 0, priceChangeUSD: 0, percentageChange: 0 },
        startTime: 0,
        endTime: 0,
        duration: 0,
      };
    }
    const pnl = await this.getPnLFromSwapHistory(swapHistory);
    const priceChange = await this.getPriceChangeFromSwapHistory(swapHistory);
    const { startTime, endTime, duration } = this.getTimeDetailsFromSwapHistory(swapHistory);

    return { pnl, priceChange, startTime, endTime, duration };
  }

  //
  // async getTransactionsFromSolscan(walletAddress, tokenAddress) {
  //   const swapDetails = await this.solscanService.getSwapDetails(walletAddress);
  // }
  //
  //
  // fromFiveMinutes(): number {
  //   return parseInt((Date.now() / 1000 - 300).toPrecision(10));
  // }
  //
  // fromOneHour(): number {
  //   return parseInt((Date.now() / 1000 - 3600).toPrecision(10));
  // }
  //
  // fromSixHours(): number {
  //   return parseInt((Date.now() / 1000 - 21600).toPrecision(10));
  // }
  //
  // fromTwelveHours(): number {
  //   return parseInt((Date.now() / 1000 - 43200).toPrecision(10));
  // }
  //
  // fromOneDay(): number {
  //   return parseInt((Date.now() / 1000 - 86400).toPrecision(10));
  // }

  async getSeriesPricePnLSummaryForWalletSolScan(params: SwapDetailsParams): Promise<PricePnLSummary> {
    try {
      const swapDetails = await this.solscanService.getSwapDetails(params);
      if (!swapDetails || swapDetails.length === 0) {
        this.logger.warn('No swap details found');
        return this.emptyPricePnLSummary;
      }
      return await this.getPricePnLSummaryFromSwapHistory(swapDetails);

    } catch (error) {
      this.logger.error(`Error fetching PricePnL data: ${error.message}`, error.stack);
      return this.emptyPricePnLSummary;
    }
  }

  //TODO: Change programId
  async getSeriesPricePnLSummaryForCollectionShyft(inputProgramId: string = constants.solana.solscan.pumpFunProgramId): Promise<PricePnLSummary[]> {
    return null;
  }

  //TODO: Change programId
  async getSeriesPricePnLSummaryForWalletShyft(walletAddress: string, tokenAddress: string = constants.solana.solscan.pumpFunProgramId): Promise<PricePnLSeries> {
    const pubkey = new PublicKey(walletAddress);
    const swapDetails = await this.swapService.getSwapDetailsFromOneDay(pubkey);
    const swapsFiltered = swapDetails.filter(swap => swap.buyToken.tokenAddress === tokenAddress || swap.sellToken.tokenAddress === tokenAddress); // Correct filtering
    const sixhoursFilterd = swapsFiltered.filter(swap => swap.timestamp > Date.now() - 6 * 60 * 60 * 1000);
    const onehourFiltered = sixhoursFilterd.filter(swap => swap.timestamp > Date.now() - 60 * 60 * 1000);
    const fiveMinFiltered = onehourFiltered.filter(swap => swap.timestamp > Date.now() - 5 * 60 * 1000);
    const five_minutes = await this.getPricePnLSummaryFromSwapHistory(fiveMinFiltered);
    const one_hour = await this.getPricePnLSummaryFromSwapHistory(onehourFiltered);
    const six_hours = await this.getPricePnLSummaryFromSwapHistory(sixhoursFilterd);
    const one_day = await this.getPricePnLSummaryFromSwapHistory(swapsFiltered);

    return { five_minutes, one_hour, six_hours, one_day };
  }


  async getUsersWinRate(tokenAddress: string, walletAddresses: string[]) {
    try {
      const results = [];

      for (const walletAddress of walletAddresses) {
        this.logger.log(`Fetching PnL summary for wallet: ${walletAddress} and token: ${tokenAddress}`);
        const pricePnlSummary = await this.getSeriesPricePnLSummaryForWalletSolScan({
          walletAddress,
          tokenAddress,
        });

        if (!pricePnlSummary) {
          this.logger.warn(`Price PnL summary could not be fetched for wallet: ${walletAddress}`);
          continue;
        }

        this.logger.debug(`Received pricePnlSummary for wallet ${walletAddress}: ${JSON.stringify(pricePnlSummary)}`);
        const pnl = pricePnlSummary?.pnl;
        const winRate = pnl?.winRate ?? 0;
        const pnlToken = pnl?.profitPercentage?.toFixed(2) ?? '0.00';

        results.push({
          walletAddress,
          pnlOfTheToken: pnlToken,
          winRate: winRate.toFixed(2),
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Error in getUsersWinRate: ${error.message}`, error.stack);
      return [];
    }
  }
}


interface PnLSolScanParams {
  walletAddress: string;
  tokenAddress?: string;
}

// test pnl
// const searchAddress = 'ASRAdM8MBHAm1sFHfmMCqqBRzKCtABGGbD1jae4vHrjy';
// const pnlService = new PnlService(searchAddress);
// pnlService.getPricePnLSummaryForAddress().then((result) => {
//     console.log(result);
// });