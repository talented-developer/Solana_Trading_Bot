export interface TokenMetadataDetails {
  token_name: string;
  token_symbol: string;
  token_description: string;
  token_image: string;
  seller_fee_basis_points: number;
  is_mutable: boolean;
  primary_sale_happened: boolean;
  twitter: string;
  telegram: string;
  website: string;
  freeze_status: string;
  mint_status: string;
  decimals: string;
  supply: string;
  age: string;
  market_name: string;
}

export interface FinancialDetails {
  balance_sol_in_sol: string;
  balance_sol_in_usdc: string;
  balance_tokens_in_sol: string;
  balance_tokens_in_usdc: string;
  wallet_token_amount: string;
  slippage: string;
  min_buy: string;
  sol_price_in_usdc: string;
  pnl_of_the_token: string;
  price_per_token: string;
  win_rate: string;
  market_cap?: string;
  liquidity?: string;
  liquidity_lock?: string;
  top_10_ownership_percentage?: string;
  number_holders: number;
  pnl_per_user_per_token: string;
  unreleased_profit: string;
}

export interface UserDetails {
  wallet_address: string;
  amountSol?: string;
  priority_fee: string;
  initial_token_amount?: string;
  token_address: string;
  creator_wallet?: string;
  creator_percentage?: string;
}

export interface TradeDetails extends TokenMetadataDetails, FinancialDetails, UserDetails {
}
