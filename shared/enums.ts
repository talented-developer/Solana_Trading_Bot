export enum PriorityFeeOption {
  Medium = '✏ Medium Fee',
  High = '✏ High Fee',
  Ultimate = '✏ Ultimate Fee',
  Custom = '✏ Custom Fee',
}


// TODO: Referral v2
export const REFERRAL_TIERS = [
  { level: 1, percent: 0.25 },
  { level: 2, percent: 0.035 },
  { level: 3, percent: 0.025 },
  { level: 4, percent: 0.02 },
  { level: 5, percent: 0.01 },
];

export enum SellActions {
  Sell10 = 'sell_10',
  Sell25 = 'sell_25',
  Sell50 = 'sell_50',
  Sell100 = 'sell_100',
  SellInitial = 'sell_initial'
}

export enum TipAccounts {
  Account1 = '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  Account2 = 'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  Account3 = 'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  Account4 = 'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  Account5 = 'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  Account6 = 'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  Account7 = 'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  Account8 = '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'
}

export enum PlatformAddresses {
  LifinityV1 = 'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S',
  MeteoraDLMM = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  Invariant = 'HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt',
  Marinade = 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
  Bonkswap = 'BSwp6bEBihVLdqJRKGgzjcGLHkcTuzmSo1TQkHepzH8p',
  Penguin = 'PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP',
  Whirlpool = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  Aldrin = 'AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6',
  RaydiumCLMM = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
  Saber = 'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ',
  Phoenix = 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
  OrcaV2 = '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',
  HeliumNetwork = 'treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5',
  GooseFX = 'GFXsSL5sSaDfNFQUYsHekbWBW1TsFdjDYzACh62tEHxn',
  StabbleWeightedSwap = 'swapFpHZwjELNnjvThjajtiVmkz3yPQEHjLtka2fwHW',
  PumpFun = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  AldrinV2 = 'CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4',
  CloneProtocol = 'C1onEW2kPetmHmwe74YC1ESx3LnFEpVau6g2pg4fHycr',
  TokenSwap = 'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8',
  DEX = 'DEXYosS6oEGvk8uCDayvwEZz4qEyDJRf9nFgYCaqPMTm',
  OrcaV1 = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1',
  Crema = 'CLMM9tUoggJu2wagPkkqs9eFG4BWhVBZWkP1qv3Sp7tR',
  Oasis = '9tKE7Mbmj4mxDjWatikzGAtkoWosiiZX9y6J4Hfm2R8H',
  CropperLegacy = 'CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh',
  Perps = 'PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu',
  SanctumInfinity = '5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx',
  Saros = 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr',
  Moonshot = 'MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG',
  SaberDecimals = 'DecZY86MU5Gj7kppfUCEmd4LbXXuyZH1yHaP2NTqdiZB',
  Cropper = 'H8W3ctz92svYg6mkn1UtGfu2aQr2fnUFHM1RhScEtQDt',
  Dexlab = 'DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N',
  Mercurial = 'MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky',
  StepN = 'Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j',
  LifinityV2 = '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c',
  Guacswap = 'Gswppe6ERWKpUTXvRPfXdzHhiCyJvLadVvXGfdpBqcE1',
  ObricV2 = 'obriQD1zbpyLz95G5n7nJe6a4DPjpFwa5XYPoNm113y',
  Openbook = 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
  RaydiumCP = 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
  FluxBeam = 'FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X',
  OpenBookV2 = 'opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb',
  Raydium = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  Raydium_v4 = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  StabbleStableSwap = 'swapNyd8XiQwJ6ianp9snpu4brUqFxadzvHebnAXjJZ',
  Meteora = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB'
}


export enum SubscriptionPlanAmount {
  // Bronze = 0.01, //TODO: change on production
  // Silver = 99,
  Gold = 197,
}

export enum SubscriptionPlanName {
  // Bronze = 'Bronze',
  // Silver = 'Silver',
  Gold = 'Gold',
  Admin = 'Admin',
}

export enum channelLinks {
  Bronze = 'https://t.me/+vCJRPp_HoSZjZTVi',
  Silver = 'https://t.me/+DNtGHCCkGPQxOWI6',
  Gold = 'https://t.me/+ct3i59G7ubowMDEy',
}

export enum MarketCapRangeNames {
  BETWEEN_1K_100K = '&lt;100K',
  BETWEEN_100K_1M = '100K - 1M',
  BETWEEN_1M_10M = '1M - 10M',
  MORE_THAN_10M = '&gt;10M',
}

export enum TransactionType {
  Buy = 'buy',
  Sell = 'Sell'
}

export enum RewardsType {
  ClaimSol = 'sol',
  ClaimUSDC = 'usdc'
}

export enum TTL_TIMING {
  TTL_ONE_HOUR = 60 * 60 * 1000,
  TTL_SIX_HOURS = 6 * 60 * 60 * 1000,
  TTL_ONE_DAY = 24 * 60 * 60 * 1000,
}