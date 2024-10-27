const constants = {
  solana: {
    ignore_creator_addresses: [
      'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
    ],
    tokens: {
      spl_programm_address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      sol_token_address: 'So11111111111111111111111111111111111111112',
      usdc_token_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      raydium_v4_contract_addresses: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    },
    transaction_type: {
      withdraw_sol: 'Withdraw SOL',
    },
    solscan: {
      baseUrl: 'https://pro-api.solscan.io/v2.0',
      pumpFunProgramId: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    },
    urls: {
      checkdex: 'https://www.checkdex.xyz',
      holderscan: 'https://holderscan.com',
      pumpFun: 'https://pump.fun',
      rugCheck: 'https://rugcheck.xyz/tokens',
      ttfBot: 'https://t.me/ttfbotbot?start=',
      raydiumSwap: 'https://raydium.io/swap',
      birdeye: 'https://birdeye.so/token',
      dexscreen: 'https://dexscreener.com/solana',
      dextools: 'https://www.dextools.io/app/en/solana/pair-explorer',
      solscan: 'https://solscan.io/account',
      bubblemaps: 'https://app.bubblemaps.io/sol/token',
      x_com_mentions: 'https://x.com/search?q=%24',
    },
  },
  commands: {
    broadcast: 'broadcast',
    message: 'message',
    alert: 'alert',
    start: 'start',
    help: 'help',
    referral: 'referral',
    plan: 'plan',
    wallet: 'wallet',
    settings: 'settings',
    trade: 'trade',
    portfolio: 'portfolio',
  },
  scenes: {
    broadcast: 'broadcast',
    message: 'message',
    alert: 'alert',
    start: 'start',
    help: 'help',
    referral: 'referral',
    plan: 'plan',
    wallet: 'wallet',
    settings: 'settings',
    trade: 'trade',
    portfolio: 'portfolio',
  },
  ref_id_mask: 192052,
  threshold: {
    buyTrendVolume: 100000,
    token_price_usd_positions: 1, //$1
  },
  delays: {
    admin: 0,
    gold: 15000, // 15 secs
    // silver: 60000, //60 secs
    // bronze: 120000, // 60 secs
  },
};

export default constants;