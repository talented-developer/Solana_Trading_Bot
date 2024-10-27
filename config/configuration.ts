import * as Joi from 'joi';
import * as process from 'node:process';
import { getAbsolutePathForProjectDirectory, splitStringIntoSet } from './configUtils';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { TipAccounts } from '@shared/enums';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: join(__dirname, '..', envFile) });
export default () => {
  const solanaRpcUrl = process.env.HELIUS_RPC_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const postgresDatabaseUrl = process.env.DATABASE_URL;
  const feeAccountAddress = process.env.ALGORA_REWARD_PUBLIC_KEY; //TODO: Change on production
  const rewardsPrivateKey = process.env.ALGORA_REWARD_PRIVATE_KEY;
  const solscanapikeyv1 = process.env.SOLSCAN_API_KEY_V1;
  const solscanapikeyv2 = process.env.SOLSCAN_API_KEY_V2;
  const shyftApiKey = process.env.SHYFT_API_KEY;
  const coinGeckoApiKey = process.env.COIN_GECKO_API_KEY; // For ATH
  const coinMarketCapApiKey = process.env.COIN_MARKET_CAP_API_KEY; //
  const birdeyeApiKey = process.env.BIRDEYE_API_KEY;
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const solanaInvoiceWalletAddress = process.env.PAYMENTS_USDC_ADDRESS_SOLANA_CHAIN; //TODO: Change on production
  const subscriptionChatId = '8096817817'; //TODO: we dont use this, dont delete
  const subscriptionInvitationLink = 'https://t.me/algoracallbot';
  const whitelistedTelegramIds = splitStringIntoSet<number>(process.env.WHITELISTED_SUBSCRIPTION_TELEGRAM_IDS, Number);
  const port = parseInt(process.env.PORT || '3000', 10);
  const providerToken = process.env.PROVIDER_TOKEN;
  const telegramApibaseUrl = `${process.env.TELEGRAM_API_BASE_URI}${telegramBotToken}`;
  return {
    telegram: {
      bot: {
        token: telegramBotToken,
        subscriptionChatId: Number(subscriptionChatId),
        subscriptionInvitationLink: subscriptionInvitationLink,
        referralStringLength: 7,
        providerToken,
        telegramApibaseUrl,
      },
      i18n: {
        fallbackLanguage: 'en',
        i18nFolderPath: getAbsolutePathForProjectDirectory('config/i18n/'),
      },
    },
    database: {
      postgres_db_url: postgresDatabaseUrl,
      redis_db_url: process.env.REDIS_URL,
    },
    blockchain: {
      solana: {
        addressLengthMin: 32,
        addressLengthMax: 44,
        privateKeyLengthMin: 85,
        privateKeyLengthMax: 88,
        addressRegex: /^[A-HJ-NP-Za-km-z1-9]{32,44}$/,
        privateKeyRegex: /^[A-HJ-NP-Za-km-z1-9]{85,88}$/,
        rpcUrl: solanaRpcUrl,
        rewardsPrivateKey,
        solanaInvoiceWalletAddress,
        feeAccountAddress,
      },
      alchemy: {
        baseUrl: 'https://solana-mainnet.g.alchemy.com/v2',
        apiKey: alchemyApiKey,
      },
      dexscreener: {
        baseUrl: 'https://api.dexscreener.com/latest/dex',
      },
      frontend_pumpfun: {
        baseUrl: 'https://frontend-api.pump.fun/coins',
      },
      birdeye: {
        baseUrl: 'https://public-api.birdeye.so',
        apiKey: birdeyeApiKey,
      },
      rugCheck: {
        baseUrl: 'https://api.rugcheck.xyz/v1',
      },
      solscan: {
        baseUrl: 'https://pro-api.solscan.io/v2.0',
        apiKey_v1: solscanapikeyv1,
        apiKey_v2: solscanapikeyv2,
      },
      shyft: {
        baseUrl: 'https://api.shyft.to',
        apiKey: shyftApiKey,
      },
      coingecko: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        apikey: coinGeckoApiKey,
      },
      coinMarketCap: {
        baseUrl: 'https://pro-api.coinmarketcap.com',
        apikey: coinMarketCapApiKey,
      },
      jupiter: {
        baseUrl: 'https://quote-api.jup.ag/v6',
        priceUrl: 'https://price.jup.ag/v6',
      },
      jito: {
        ednpotins: [
          'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
          'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
          'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
          'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
          'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
          'https://slc.mainnet.block-engine.jito.wtf'
        ],
        tipAccounts: [
          'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
          'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
          '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
          '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
          'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
          'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
          'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
          'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
        ]
      },
      ethereum: {
        addressLength: 42,
        privateKeyLength: 66,
      },
      ton: {},
    },
    heroku: {
      hostname: '0.0.0.0',
      port: port,
    },

  };
};
export const configurationValidationSchema = Joi.object({
  telegram: Joi.object({
    bot: Joi.object({
      token: Joi.string().required(),
      subscriptionChatId: Joi.number().required(),
      subscriptionInvitationLink: Joi.string().uri().optional(),
      blockchainNetworkDisplayName: Joi.string().required(),
      referralStringLength: Joi.number().required(),
      whitelistedTelegramIds: Joi.array().items(Joi.number()).optional(),
      providerToken: Joi.string().required(),
    }).required(),
    i18n: Joi.object({
      fallbackLanguage: Joi.string().required(),
      i18nFolderPath: Joi.string().required(),
    }).required(),
  }).optional(),
  database: Joi.object({
    postgres_db_url: Joi.string().required(),
  }),
  blockchain: Joi.object({
    birdeye: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiKey: Joi.string().required(),
    }).required(),
    solana: Joi.object({
      addressLengthMin: Joi.number().required(),
      addressLengthMax: Joi.number().required(),
      privateKeyLengthMin: Joi.number().required(),
      privateKeyLengthMax: Joi.number().required(),
      addressRegex: Joi.string().required(),
      privateKeyRegex: Joi.string().required(),
      rpcUrl: Joi.string().uri().required(),
      solanaInvoiceWalletAddress: Joi.string().required(),
      feeAccountAddress: Joi.string().required(),
      rewardsPrivateKey: Joi.string().required(),
    }).required(),
    ethereum: Joi.object({
      addressLength: Joi.number().required(),
      privateKeyLength: Joi.number().required(),
    }).required(),
    alchemy: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiKey: Joi.string().required(),
    }).required(),
    dexscreener: Joi.object({
      baseUrl: Joi.string().uri().required(),
    }).required(),
    rugCheck: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiSolanaWalletPrivateKey: Joi.string().required().regex(/^[A-HJ-NP-Za-km-z1-9]{85,88}$/),
    }).required(),
    solscan: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiKey: Joi.string().required(),
    }).required(),
    solintel: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiKey: Joi.string().required(),
    }).required(),
    shyft: Joi.object({
      baseUrl: Joi.string().uri().required(),
      apiKey: Joi.string().required(),
    }).required(),
    coingecko: Joi.object({
      baseUrl: Joi.string().uri().required(),
    }).required(),
    jupiter: Joi.object({
      baseUrl: Joi.string().uri().required(),
      priceUrl: Joi.string().uri().required(),
    }).required(),
    jito: Joi.object({
      baseUrl: Joi.string().uri().required(),
    }).required(),
    ton: Joi.object().optional(),
  }).optional(),
  heroku: Joi.object({
    hostname: Joi.string().required(),
    port: Joi.number().required(),
  }).optional(),
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  BIRDEYE_API_KEY: Joi.string().required(),
  HELIUS_RPC_URL: Joi.string().required(),
  PORT: Joi.number().optional(),
  SUBSCRIPTION_CHAT_ID: Joi.string().optional(),
  WHITELISTED_SUBSCRIPTION_TELEGRAM_IDS: Joi.string().optional().regex(/^(\d*(\s*,\s*)?)+$/),
  NEST_DEBUG: Joi.boolean().optional(),
  ALCHEMY_API_KEY: Joi.string().required(),
  SHYFT_API_KEY: Joi.string().required(),
  SOLSCAN_API_KEY_V1: Joi.string().required(),
  SOLSCAN_API_KEY_V2: Joi.string().required(),
});
