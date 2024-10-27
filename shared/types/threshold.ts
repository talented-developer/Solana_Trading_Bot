export const thresholdValues = {
  mutable: false, // do not provide mutable tokens
  mintAuthority: null, // do not provide mintable tokens
  freezeAuthority: null,  // do not provide freezable token
  liquidityLockThreshold: 80, // 80% and above passes
  devWalletPercentageThreshold: 30,  // 30% and less passes
  liquidityThreshold: 2000, // $
  minimalVolumeSpike: 100, // in USD
  volumeSpikeBuyThreshold: 50, // 50%
  volumeSpikeSellThreshold: -33, // -33%
  numberOfHolders: 100, // number of holders
  scoreThreshold: 4,  // score low range
  raydiumAgeOfToken: 1,  //1h
  top10OwnershipPercentageThreshold: 50, // %
  liquidityRatioThreshold: 0.005, // liquidity ratio threshold (0.5%)
  buyVolumeCount: 10,  // $100K
  priceChange: 0.5, //0.5%
  whaleUsdBalance: 100000,
  rewardPerSwapToInviter: 0.003, // 30% of 1% = 0.3%,
  minimalSOLToClaim: 0.0001, // 0.1 SOL
  minimalUSDCToClaim: 30, // $30 USDC
  rewardPerSubscriptionToInviter: 0.2, // 20%
  algoraSwapFees: 0.01, // 1% from swap tx. 1 SOL swap = 0.01 SOL to Algora
  referralFees: 0.3, // 30% from algora wallet fees. 1 SOL swap = 0.00025 SOL to Referral
};
