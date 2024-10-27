import { Injectable, Logger } from '@nestjs/common';
import { Settings, User } from '@prisma/client';
import constants from '@shared/constants';
import { TransactionRepository } from '../../../db/repository/transaction.repository';
import { UserRepository } from '../../../db/repository/user.repository';
import { DexscreenerService } from '../../../providers/dexscreener/dexscreener.service';
import { JupiterService } from '../../../providers/jupiter/jupiter.service';
import { PnlService } from '../../../providers/pnl/pnl.service';
import { RugCheckService } from '../../../providers/rug-check/rug-check.service';
import { SolanaService } from '../../../providers/solana/solana.service';
import { ScoreManager } from '../../managers/score-manager';
import { UtilsService } from '../utils/utils.service';
import { SolscanService } from '../../../providers/solscan/solscan.service';
import { BirdeyeService } from '../../../providers/birdeye/birdeye.service';
import { I18nService } from 'nestjs-i18n';
import { MarketCapService } from '../../../providers/jupiter/marketcap.service';
import { thresholdValues } from '../../../../shared/types/threshold';

@Injectable()
export class TokenDetailsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly utilsService: UtilsService,
    private readonly solanaService: SolanaService,
    private readonly solscanService: SolscanService,
    private readonly rugCheckService: RugCheckService,
    private readonly userService: UserRepository,
    private readonly scoreManager: ScoreManager,
    private readonly marketCapService: MarketCapService,
    private readonly dexscreenerService: DexscreenerService,
    private readonly pnlService: PnlService,
    private readonly jupiterService: JupiterService,
    private readonly transactionService: TransactionRepository,
    private readonly birdeyeService: BirdeyeService,
  ) {
  }

  async getTokenDetailsForTrade(tokenAddress: string, user: User, settings: Settings) {
    const userPnlAndWinrateDetails = await this.getUserPnl(tokenAddress, user);
    const tokenPnlAndWinrate = await this.getTokenPnlAndWinRate(tokenAddress);
    const tokenDetails = await this.getTokenDetails(tokenAddress);
    const walletDetails = await this.fetchWalletDetails(user, tokenAddress, settings, tokenDetails.decimals);
    const transactionRecord = await this.transactionService.getInitialTransaction(user.id, tokenDetails.tokenMetadata.address);
    const initialTokenAmount = transactionRecord ? transactionRecord.amountTokens : '0';

    return this.createTokenDetailsForTrading(
      tokenDetails,
      walletDetails,
      initialTokenAmount,
      tokenPnlAndWinrate,
      userPnlAndWinrateDetails,
    );
  }

  async getUserPnl(tokenAddress: string, user: User) {
    const pricePnlSummary = await this.pnlService.getSeriesPricePnLSummaryForWalletSolScan({
      walletAddress: user.walletAddress,
      tokenAddress,
    });

    const pnlOfUser = pricePnlSummary?.pnl?.profitPercentage?.toFixed(2) || '0.00';
    return { pnlOfUser: `${pnlOfUser}%` };
  }

  async getTokenPnlAndWinRate(tokenAddress: string) {
    try {
      const pricePnlSummary = await this.pnlService.getSeriesPricePnLSummaryForWalletSolScan({
        walletAddress: tokenAddress,
        tokenAddress,
      });
      const pnl = pricePnlSummary?.pnl;
      const winRate = pnl?.winRate ?? 0;
      const pnlToken = pnl?.profitPercentage?.toFixed(2) ?? '0.00';
      const formattedPnl = `${pnlToken}%`;
      const formattedWinRate = `${winRate.toFixed(2)}%`;

      return {
        pnlOfTheToken: formattedPnl,
        winRate: formattedWinRate,
      };
    } catch (error) {
      this.logger.error(`Error in getTokenPnlAndWinRate: ${error.message}`);
      return { pnlOfTheToken: 'N/A', winRate: 'N/A' };
    }
  }

  async getTokenDetails(tokenAddress: string) {
    const tokenMetadata = await this.solanaService.getTokenMetadata(tokenAddress);
    if (!tokenMetadata) {
      this.logger.error('Token metadata not found.');
      return null;
    }
    const devWalletAddress = await this.rugCheckService.getDevWalletAddress(tokenAddress);
    const top10holders = await this.rugCheckService.getTopHoldersPercentage(tokenAddress);
    const lpLockedData = await this.rugCheckService.getLiquidityLock(tokenAddress);
    const liquidity = await this.rugCheckService.getLiquidity(tokenAddress);
    const mutable = await this.rugCheckService.getMutable(tokenAddress) || tokenMetadata?.isMutable;
    const isMutableText = mutable ? 'Yes' : 'No';
    this.logger.debug(`liquidity value: ${liquidity}`);
    const formattedLiquidity = this.utilsService.formatNumberToUSA(liquidity);
    const mintAuthority = await this.rugCheckService.getMintAuthority(tokenAddress);
    const freezeAuthority = await this.rugCheckService.getFreezeAuthority(tokenAddress);
    const devTokenBalanceLamports = await this.solanaService.getTokenBalanceByWalletAddress(tokenAddress, devWalletAddress);
    const decimals = await this.rugCheckService.getDecimals(tokenAddress);
    const supplyInLamports = await this.rugCheckService.getSupply(tokenAddress);
    const supplyInUnits = supplyInLamports / Math.pow(10, decimals);
    const devWalletPercentage = ((devTokenBalanceLamports / supplyInLamports) * 100).toFixed(2);
    this.logger.debug(`devTokenBalance from tokenDetails: ${devWalletPercentage}`);
    const formattedSupply = this.utilsService.formatLargeNumber(supplyInUnits);
    const numberHolders = await this.solscanService.getTotalTokenHolders(tokenAddress);
    const formatNumberOfHolders = this.utilsService.formatNumberToUSA(numberHolders);
    const formattedLpLockedPercentage = this.utilsService.formatPercentage(lpLockedData.lpLockedPercentage);
    const marketData = await this.dexscreenerService.fetchMarketDataByTokenAddress(tokenAddress);
    const primaryPair = marketData?.pairs?.[0];
    if (!primaryPair || !primaryPair.priceUsd) {
      this.logger.error('PrimaryPair or priceUsd is not available.');
      return;
    }
    const priceTokenUSDC = primaryPair.priceUsd;
    const createdAtMilliseconds = primaryPair.pairCreatedAt;
    this.logger.debug(`createdAtMilliseconds: ${createdAtMilliseconds}`);
    const tokenAgeHHDD = this.utilsService.getTokenAgeDDHH(createdAtMilliseconds);
    this.logger.debug(`tokenAgeHHDD: ${tokenAgeHHDD}`);
    const timeFromInSeconds = Math.floor(createdAtMilliseconds / 1000);
    const timeTo = Math.floor(Date.now() / 1000);
    const ageOfTokenInSeconds = timeTo - timeFromInSeconds;
    const priceMax = await this.birdeyeService.getMaxPrice(tokenAddress, timeTo, timeFromInSeconds, ageOfTokenInSeconds);
    const spikeInVol = (primaryPair.volume?.m5 - (primaryPair.volume?.h1 / 12)) / (primaryPair.volume?.h1 / 12);
    const info = primaryPair?.info || {};
    const image = await this.rugCheckService.getImage(tokenAddress);
    const imageUrl = info.imageUrl;
    const getSocialUrl = (type: string) => info.socials?.find(social => social.type === type)?.url || '';
    const twitterUrl = getSocialUrl('twitter');
    const telegramUrl = getSocialUrl('telegram');
    const websiteUrl = info.websites?.[0]?.url || '';
    const priceChange5min = this.formatPriceChange(primaryPair.priceChange?.m5);
    const formattedTop10holders = this.utilsService.formatPercentage(top10holders);
    const isPriceChangeSignificant = (priceChange: number) => {
      const significantChange = Math.abs(priceChange) > thresholdValues.priceChange;
      this.logger.debug(`Price Change: ${priceChange}, Significant: ${significantChange}`);
      return significantChange;
    };
    const priceTrend5min = isPriceChangeSignificant(primaryPair.priceChange?.m5 ?? 0)
      ? (primaryPair.priceChange?.m5 > 0
        // ? '⚠️ Trend Buy Detected\n'
        ? ''
        : '')
      // : '⚠️ Trend Sell Detected\n')
      : '';
    this.logger.debug(`Price Trend (5 min): ${priceTrend5min}`);
    const priceChange1Hr = this.formatPriceChange(primaryPair.priceChange?.h1);
    this.logger.debug(`Price Change (1 Hr): ${priceChange1Hr}`);
    const priceChange24Hr = this.formatPriceChange(primaryPair.priceChange?.h24);
    this.logger.debug(`Price Change (24 Hr): ${priceChange24Hr}`);
    const volume5min = this.utilsService.formatLargeNumber(primaryPair.volume?.m5);
    this.logger.debug(`Volume (5 min): ${volume5min}`);
    // const isVolumeSpike = (volume: number) => {
    //   const spikeDetected = volume > constants.threshold.buyTrendVolume;
    //   this.logger.debug(`Volume: ${volume}, Spike Detected: ${spikeDetected}`);
    //   return spikeDetected;
    // };
    // const volume5minTrend = isVolumeSpike(primaryPair.volume?.m5 ?? 0)
    //   ? '⚠️ Big Spike Detected\n'
    //   : '';
    // this.logger.debug(`Volume Trend (5 min): ${volume5minTrend}`);
    const volume1Hr = this.utilsService.formatLargeNumber(primaryPair.volume?.h1);
    const volume24Hr = this.utilsService.formatLargeNumber(primaryPair.volume?.h24);
    const marketCapUsdc = await this.marketCapService.getMarketCap(tokenAddress) || 0;
    const ath = supplyInUnits * priceMax;
    const updatedAth = marketCapUsdc > ath ? marketCapUsdc : ath;
    const formattedAth = this.utilsService.formatLargeNumber(updatedAth);
    const formattedMarketCap = this.utilsService.formatLargeNumber(marketCapUsdc);
    const liquidityRatio = marketCapUsdc > 0 ? (liquidity / marketCapUsdc) * 100 : 0;
    // this.logger.debug(`marketCapUsdc: ${marketCapUsdc}`);
    // this.logger.debug(`liquidity: ${liquidity} / marketCapUsdc ${marketCapUsdc} * 100`);
    // this.logger.debug(`Liquidity Ratio: ${liquidityRatio}`);

    const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
    const marketName = primaryPair?.dexId ? capitalizeFirstLetter(primaryPair.dexId) : null;

    return {
      createdAtMilliseconds,
      liquidityRatio,
      primaryPair,
      mutable,
      isMutableText,
      spikeInVol,
      formattedAth,
      marketCapValue: marketCapUsdc,
      tokenMetadata,
      formatNumberOfHolders,
      numberHolders,
      devWalletPercentage,
      image,
      imageUrl,
      liquidity,
      formattedLiquidity,
      lpLockedData,
      liquidity_lock_percentage: formattedLpLockedPercentage,
      formattedMarketCap,
      formattedSupply,
      formattedTop10holders,
      top10holders,
      marketName,
      tokenAge: tokenAgeHHDD,
      ageOfTokenInSeconds,
      priceChange5min,
      priceTrend5min,
      priceChange1Hr,
      priceChange24Hr,
      volume5min,
      // volume5minTrend,
      volume1Hr,
      volume24Hr,
      mintAuthority,
      freezeAuthority,
      twitterUrl,
      telegramUrl,
      websiteUrl,
      decimals,
      priceTokenUSDC,
    };
  }

  async createTokenDetailsForTrading(
    tokenDetails,
    walletDetails,
    initialTokenAmount: string,
    tokenPnlAndWinrate,
    userPnl,
  ) {
    const tokenLinks = this.getTokenLinks(tokenDetails.tokenMetadata.address);
    const tokenBalanceInUSDC = (walletDetails.tokenBalance * tokenDetails.priceTokenUSDC).toFixed(4);
    this.logger.debug(`wallet details: ${JSON.stringify(walletDetails)}`);
    const tokenSymbol = tokenDetails.tokenMetadata.json?.symbol.toUpperCase();
    const lpRatioNumber = Math.round(tokenDetails.liquidityRatio);
    return {
      // ALERT DETAILS
      token_image: tokenDetails.image || tokenDetails.imageUrl || '',
      token_name: tokenDetails.tokenMetadata.json?.name,
      market_name: tokenDetails?.marketName || '',
      token_address: tokenDetails.tokenMetadata.address,
      token_symbol: tokenSymbol,
      market_cap: tokenDetails.formattedMarketCap,
      token_age: tokenDetails.tokenAge,
      top_10_holders: tokenDetails.formattedTop10holders,
      creator_percentage: tokenDetails.devWalletPercentage,
      number_holders: tokenDetails.formatNumberOfHolders,
      liquidity_lock_percentage: tokenDetails.liquidity_lock_percentage,
      liquidity: tokenDetails.formattedLiquidity,
      liquidityRatio: `${lpRatioNumber}%`,
      supply: tokenDetails.formattedSupply,
      price_change_5min: tokenDetails.priceChange5min,
      price_trend: tokenDetails.priceTrend5min,
      price_change_1hr: tokenDetails.priceChange1Hr,
      price_change_24hr: tokenDetails.priceChange24Hr,
      ath: tokenDetails.formattedAth,
      volume_5min: tokenDetails.volume5min,
      // volume_trend: tokenDetails.volume5minTrend,
      volume_1hr: tokenDetails.volume1Hr,
      volume_24hr: tokenDetails.volume24Hr,
      mint_authority: tokenDetails.mintAuthority ? 'Yes' : 'No',
      is_mutable: tokenDetails.isMutableText,
      freeze_status: tokenDetails.freezeAuthority ? 'Yes' : 'No',
      // LINKS
      x_com_link: tokenDetails.tokenMetadata.twitter || tokenDetails.twitterUrl || '',
      telegram: tokenDetails.tokenMetadata.telegram || tokenDetails.telegramUrl || '',
      website: tokenDetails.tokenMetadata.website || tokenDetails.websiteUrl || '',
      dexscreen: tokenLinks.dex_screen,
      dextools: tokenLinks.dex_tools,
      birdeye: tokenLinks.birdseye,
      check_dex: tokenLinks.checkDex,
      holder_scan: tokenLinks.holderScan,
      pump_fun: tokenLinks.pumpFun,
      rug_check: tokenLinks.rugCheck,
      ttf_bot: tokenLinks.ttfBot,
      solscan: tokenLinks.solscan,
      bublemaps: tokenLinks.bublemaps,
      x_com_mentions: `${tokenLinks.x_com_mentions}${tokenDetails.tokenMetadata.json?.name}`,
      //PNL
      win_rate: tokenPnlAndWinrate.winRate,
      // WALLET DETAILS
      initial_token_amount: initialTokenAmount,
      balance_sol_in_sol: walletDetails.balanceInSol,
      balance_sol_in_usdc: walletDetails.balanceInUsdc,
      balance_tokens_in_sol: walletDetails.formattedTokenBalance,
      rawTokenBalance: walletDetails.rawTokenBalance,
      balance_tokens_in_usdc: Number(tokenBalanceInUSDC).toFixed(2).toString(),
      wallet_address: walletDetails.walletAddress,
      slippage: walletDetails.formattedSlippage,
      min_buy: walletDetails.formattedMinBuy,
      mevProtection: walletDetails.mevProtection ? 'On' : 'Off',
      priority_fee: walletDetails.formattedPriorityFee,
      sol_price_in_usdc: walletDetails.solPriceInUsdc,
      decimals: tokenDetails.tokenMetadata.mint.decimals,
      pnl_per_user_per_token: userPnl.pnlOfUser,
    };
  }

  getTokenLinks(tokenAddress: string, whale_address?: string) {
    const urls = constants.solana.urls;
    return {
      checkDex: `${urls.checkdex}/${tokenAddress}`,
      holderScan: `${urls.holderscan}/${tokenAddress}`,
      pumpFun: `${urls.pumpFun}/${tokenAddress}`,
      rugCheck: `${urls.rugCheck}/${tokenAddress}`,
      ttfBot: `${urls.ttfBot}/${tokenAddress}`,
      dex_screen: `${urls.dexscreen}/${tokenAddress}`,
      dex_tools: `${urls.dextools}/${tokenAddress}&utm_source=algoracallbot`,
      birdseye: `${urls.birdeye}/${tokenAddress}&utm_source=algoracallbot`,
      solscan: `${urls.solscan}/${tokenAddress}`,
      solscan_whale: whale_address ? `${urls.solscan}/${whale_address}` : '',
      bublemaps: `${urls.bubblemaps}/${tokenAddress}`,
      x_com_mentions: `${urls.x_com_mentions}`,
    };
  }

  private formatPriceChange(value: number | undefined): string {
    if (value === undefined || value === null || isNaN(value)) {
      return 'NaN';
    }
    return this.formatChangeValue(value);
  }

  private formatChangeValue(value: number): string {
    const formattedValue = Math.abs(value).toFixed(1).replace(/\.?0+$/, '');
    return `${value >= 0 ? '+' : '-'}${formattedValue}%`;
  }

  async fetchWalletDetails(user: User, tokenAddress: string, settings: Settings, decimals) {
    const rawDetails = await this.formatWalletDetails(user, tokenAddress);
    const tokenBalance = rawDetails.tokenBalanceInLamports / (10 ** decimals);
    const rawTokenBalance = rawDetails.tokenBalanceInLamports;
    const formattedTokenBalance = this.utilsService.formatLargeNumber(tokenBalance);
    const formattedMinBuy = settings.minBuy.toString();
    const formattedSlippage = settings.slippage.toString();
    const formattedPriorityFee = settings.priorityFee.toString();
    const mevProtection = settings.mevProtection;
    return {
      balanceInSol: rawDetails.balanceInSol.toFixed(3),
      balanceInUsdc: rawDetails.balanceInUsdc.toFixed(2),
      formattedTokenBalance,
      tokenBalance: tokenBalance.toString(),
      rawTokenBalance,
      solPriceInUsdc: rawDetails.solPriceInUsdc.toFixed(2),
      walletAddress: rawDetails.walletAddress,
      formattedMinBuy,
      formattedSlippage,
      formattedPriorityFee,
      mevProtection,
//TODO: FIX BALANCE
    };
  }

  async formatWalletDetails(user: User, tokenAddress: string) {
    const balanceInLamports = await this.solanaService.getSolBalance(user.walletAddress);
    const balanceInSol = this.utilsService.lamportsToSol(balanceInLamports);
    const solPriceInUsdc = await this.jupiterService.getSolPriceInUsdc();
    const balanceInUsdc = balanceInSol * solPriceInUsdc;
    const fromSecretKey = await this.userService.getUserSecretKey(user.id);
    const fromKeypair = this.solanaService.keypairFromSecretKeyString(fromSecretKey);
    const userTokenAccount = await this.solanaService.getOrCreateTokenAccount(fromKeypair, tokenAddress, user.walletAddress);
    const hasSufficientBalance = await this.solanaService.checkUserSolBalance(user.walletAddress);
    this.logger.debug(`User has sufficient balance: ${hasSufficientBalance}`);
    const tokenBalanceInLamports = await this.solanaService.getTokenBalance(userTokenAccount);
    this.logger.debug(`tokenBalanceInLamports: ${tokenBalanceInLamports}`);

    return {
      balanceInSol,
      balanceInUsdc,
      tokenBalanceInLamports,
      solPriceInUsdc,
      walletAddress: user.walletAddress,
    };
  }
}
