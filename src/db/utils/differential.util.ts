interface TokenDetails {
    timestamp: number;
    primaryPair: {
      priceUsd: string;
      txns: Record<string, { buys: number; sells: number }>;
      volume: Record<string, string>;
      liquidity: { usd: number; base: number; quote: number };
      fdv: number;
      marketCap?: number; // Optional field
    };
    numberHolders: string;
  }

  export function getDifferentialBreakdown(prevTkDetails, currentTkDetails): any {
    const {
        durationString,
        numberHoldersString,
        volumeStrings,
        txnsDiffStrings,
        liquidityDiffStrings,
        priceUsdString,
        fdvString,
        marketCapString,
        volumeSignal,
        volumeSignal5m
      } = calculateDifferentials(prevTkDetails, currentTkDetails);

      //format to date time string
        const before = new Date(prevTkDetails.timestamp).toLocaleString();
        const current = new Date().toLocaleString();

      const differentialBreakdown = {
        before,
        current,
        durationString,
        numberHoldersString,
        ...volumeStrings.reduce((acc, str, idx) => ({ ...acc, [`volumeString${idx + 1}`]: str }), {}),
        ...txnsDiffStrings.reduce((acc, str, idx) => ({ ...acc, [`txnsDiffString${idx + 1}`]: str }), {}),
        ...liquidityDiffStrings.reduce((acc, str, idx) => ({ ...acc, [`liquidityDiffString${idx + 1}`]: str }), {}),
        priceUsdString,
        fdvString,
        marketCapString,
        volumeSignal,
        volumeSignal5m
      };

      const breakdown = JSON.stringify(differentialBreakdown, null, 2);
      const cleanedBreakdownStr = breakdown.replace(/String/g, '');
      const cleanedBreakdown = JSON.parse(cleanedBreakdownStr);


      return cleanedBreakdown;
  }
  
  export function getVolumeIncreasePercentage(prevVolume: string, currentVolume: string, period: string): string {
    const prevVol = Number.parseInt(prevVolume);
    const currentVol = Number.parseInt(currentVolume);
    const volDiff = currentVol - prevVol;
    return `Volume (${period}): ${prevVol} -> ${currentVol} (${volDiff} (${((volDiff / prevVol) * 100).toFixed(2)}%))`;
  }
  
  export function formatDuration(duration: number): string {
    const totalSeconds = Math.floor(duration / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const remainderAfterDays = totalSeconds % (3600 * 24);
    const hours = Math.floor(remainderAfterDays / 3600);
    const remainderAfterHours = remainderAfterDays % 3600;
    const minutes = Math.floor(remainderAfterHours / 60);
    const seconds = remainderAfterHours % 60;
  
    let durationString = '';
    if (days > 0) {
      durationString += `${days} days, `;
    }
    if (hours > 0) {
      durationString += `${hours} hours, `;
    }
    if (minutes > 0) {
      durationString += `${minutes} minutes, `;
    }

    durationString += `${seconds} seconds`;

    return durationString;
  }
  
  export function calculateDifferentials(prevDetails: TokenDetails | null, currentDetails: TokenDetails): any {
    if (!prevDetails) {
      return {
        durationString: '',
        numberHoldersString: '',
        volumeStrings: [],
        txnsDiffStrings: [],
        liquidityDiffStrings: [],
        priceUsdString: '',
        fdvString: '',
        marketCapString: '',
        volumeSignal: ''
      };
    }
  
    const duration = currentDetails.timestamp - prevDetails.timestamp;
    const durationString = formatDuration(duration);
  
    const prevNumberHolders = Number.parseInt(prevDetails.numberHolders);
    const numberHolders = Number.parseInt(currentDetails.numberHolders);
    const numberHoldersDiff = numberHolders - prevNumberHolders;
    const numberHoldersString = `Number of holders: ${prevNumberHolders} -> ${numberHolders} (${numberHoldersDiff} (${((numberHoldersDiff / prevNumberHolders) * 100).toFixed(2)}%))`;
  
    const periods = ['m5', 'h1', 'h6', 'h24'];
    const volumeStrings = periods.map(period => {
      const prevVolume = prevDetails.primaryPair.volume?.[period]?.toString() ?? '0';
      const currentVolume = currentDetails.primaryPair.volume?.[period]?.toString() ?? '0';
      return getVolumeIncreasePercentage(prevVolume, currentVolume, period);
    });
  
    const txnsDiffStrings = periods.flatMap(period => {
      const prevBuys = prevDetails.primaryPair.txns?.[period]?.buys ?? 0;
      const currentBuys = currentDetails.primaryPair.txns?.[period]?.buys ?? 0;
      const buysDiff = currentBuys - prevBuys;
      const buysDiffString = `Buys (${period}): ${prevBuys} -> ${currentBuys} (${buysDiff} (${((buysDiff / (prevBuys || 1)) * 100).toFixed(2)}%))`;
  
      const prevSells = prevDetails.primaryPair.txns?.[period]?.sells ?? 0;
      const currentSells = currentDetails.primaryPair.txns?.[period]?.sells ?? 0;
      const sellsDiff = currentSells - prevSells;
      const sellsDiffString = `Sells (${period}): ${prevSells} -> ${currentSells} (${sellsDiff} (${((sellsDiff / (prevSells || 1)) * 100).toFixed(2)}%))`;
  
      return [buysDiffString, sellsDiffString];
    });
  
    const liquidityDiffStrings = [];
    const usdDiff = currentDetails.primaryPair.liquidity.usd - (prevDetails.primaryPair.liquidity?.usd ?? 0);
    const usdDiffString = `Liquidity (USD): ${prevDetails.primaryPair.liquidity?.usd ?? 0} -> ${currentDetails.primaryPair.liquidity.usd} (${usdDiff} (${((usdDiff / (prevDetails.primaryPair.liquidity?.usd ?? 1)) * 100).toFixed(2)}%))`;
  
    const baseDiff = currentDetails.primaryPair.liquidity.base - (prevDetails.primaryPair.liquidity?.base ?? 0);
    const baseDiffString = `Liquidity (Base): ${prevDetails.primaryPair.liquidity?.base ?? 0} -> ${currentDetails.primaryPair.liquidity.base} (${baseDiff} (${((baseDiff / (prevDetails.primaryPair.liquidity?.base ?? 1)) * 100).toFixed(2)}%))`;
  
    const quoteDiff = currentDetails.primaryPair.liquidity.quote - (prevDetails.primaryPair.liquidity?.quote ?? 0);
    const quoteDiffString = `Liquidity (Quote): ${prevDetails.primaryPair.liquidity?.quote ?? 0} -> ${currentDetails.primaryPair.liquidity.quote} (${quoteDiff} (${((quoteDiff / (prevDetails.primaryPair.liquidity?.quote ?? 1)) * 100).toFixed(2)}%))`;
  
    liquidityDiffStrings.push(usdDiffString, baseDiffString, quoteDiffString);
  
    const priceUsdDiff = parseFloat(currentDetails.primaryPair.priceUsd) - parseFloat(prevDetails.primaryPair.priceUsd);
    const priceUsdString = `Price (USD): ${parseFloat(prevDetails.primaryPair.priceUsd)} -> ${parseFloat(currentDetails.primaryPair.priceUsd)} (${priceUsdDiff.toFixed(4)} (${((priceUsdDiff / parseFloat(prevDetails.primaryPair.priceUsd)) * 100).toFixed(2)}%))`;
  
    const fdvDiff = currentDetails.primaryPair.fdv - (prevDetails.primaryPair.fdv ?? 0);
    const fdvString = `FDV: ${prevDetails.primaryPair.fdv} -> ${currentDetails.primaryPair.fdv} (${fdvDiff} (${((fdvDiff / (prevDetails.primaryPair.fdv ?? 1)) * 100).toFixed(2)}%))`;
  
    const marketCapDiff = (currentDetails.primaryPair.marketCap ?? 0) - (prevDetails.primaryPair.marketCap ?? 0);
    const marketCapString = `Market Cap: ${prevDetails.primaryPair.marketCap ?? 0} -> ${currentDetails.primaryPair.marketCap ?? 0} (${marketCapDiff} (${((marketCapDiff / (prevDetails.primaryPair.marketCap ?? 1)) * 100).toFixed(2)}%))`;
  
    // Calculate volume signal
    const m5Buys = currentDetails.primaryPair.txns?.m5?.buys ?? 0;
    const m5Sells = currentDetails.primaryPair.txns?.m5?.sells ?? 0;
    const h1Buys = currentDetails.primaryPair.txns?.h1?.buys ?? 0;
    const h1Sells = currentDetails.primaryPair.txns?.h1?.sells ?? 0;

    const m5BuysBefore = prevDetails.primaryPair.txns?.m5?.buys ?? 0;
    const m5SellsBefore = prevDetails.primaryPair.txns?.m5?.sells ?? 0;
  
    const volumeSignalPercentage = ((m5Buys - m5Sells) - ((h1Buys - h1Sells) / 12)) / ((h1Buys - h1Sells) / 12) * 100;

    const volumeSignal5mPercentage = (((m5Buys - m5Sells) - ((m5BuysBefore - m5SellsBefore)) / ((m5BuysBefore - m5SellsBefore))) * 100);



    let volumeSignal = '';
    let volumeSignal5m = '';
  
        if (volumeSignalPercentage >= 50) {
        volumeSignal = `Call Signal (${volumeSignalPercentage.toFixed(2)}%)`;
        } else if (volumeSignalPercentage <= -33) {
        volumeSignal = `Sell Signal (${volumeSignalPercentage.toFixed(2)}%)`;
        } else {
        volumeSignal = `Neutral Signal (${volumeSignalPercentage.toFixed(2)}%)`;
        }

        if (volumeSignal5mPercentage >= 50) {
        volumeSignal5m = `Call Signal (${volumeSignal5mPercentage.toFixed(2)}%)`;
        } else if (volumeSignal5mPercentage <= -33) {
        volumeSignal5m = `Sell Signal (${volumeSignal5mPercentage.toFixed(2)}%)`;
        } else {
        volumeSignal5m = `Neutral Signal (${volumeSignal5mPercentage.toFixed(2)}%)`;
        }

    return { durationString, numberHoldersString, volumeStrings, txnsDiffStrings, liquidityDiffStrings, priceUsdString, fdvString, marketCapString, volumeSignal,volumeSignal5m };
  }