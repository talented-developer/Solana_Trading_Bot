"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationValidationSchema = void 0;
const Joi = __importStar(require("joi"));
const process = __importStar(require("node:process"));
const configUtils_1 = require("./configUtils");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
var Environment;
(function (Environment) {
    Environment["Mainnet"] = "mainnet";
    Environment["Testnet"] = "testnet";
})(Environment || (Environment = {}));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: (0, path_1.join)(__dirname, '..', envFile) });
const CURRENT_ENVIRONMENT = process.env.CURRENT_ENVIRONMENT;
exports.default = () => {
    const solanaRpcUrl = process.env.SOLANA_RPC_URL;
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const solanaInvoiceWalletAddress = process.env.PAYMENTS_USDC_ADDRESS_SOLANA_CHAIN;
    const feeAccountAddress = process.env.FEE_ACCOUNT_ADDRESS_SOLANA_CHAIN;
    const postgresDatabaseUrl = process.env.POSTGRES_DATABASE_URL;
    const mongoDatabaseUrl = process.env.MONGO_DATABASE_URL;
    const usdcAddressSolanaChain = process.env.USDC_ADDRESS_SOLANA_CHAIN;
    const usdcRewardsPrivateKey = process.env.USDC_REWARDS_WALLET_PRIVATE_KEY;
    const solscanApiKey = process.env.SOLSCAN_API_TOKEN;
    const shyftApiKey = process.env.SHYFT_API_KEY;
    const subscriptionChatId = process.env.SUBSCRIPTION_CHAT_ID;
    const birdeyeApiKey = process.env.BIRDEYE_API_KEY;
    const subscriptionInvitationLink = process.env.SUBSCRIPTION_INVITATION_LINK || 'https://t.me/algora_bot';
    const whitelistedTelegramIds = (0, configUtils_1.splitStringIntoSet)(process.env.WHITELISTED_SUBSCRIPTION_TELEGRAM_IDS, Number);
    const port = parseInt(process.env.PORT || '3000', 10);
    const providerToken = process.env.PROVIDER_TOKEN;
    return {
        telegram: {
            bot: {
                token: telegramBotToken,
                subscriptionChatId: Number(subscriptionChatId),
                subscriptionInvitationLink: subscriptionInvitationLink,
                blockchainNetworkDisplayName: CURRENT_ENVIRONMENT === Environment.Testnet ? 'Testnet Solana' : 'Solana',
                referralStringLength: 7,
                whitelistedTelegramIds: whitelistedTelegramIds,
                providerToken,
            },
            i18n: {
                fallbackLanguage: 'en',
                i18nFolderPath: (0, configUtils_1.getAbsolutePathForProjectDirectory)('config/i18n/'),
            },
        },
        database: {
            postgres_db_url: postgresDatabaseUrl,
            mongo_db_url: mongoDatabaseUrl,
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
                solanaInvoiceWalletAddress,
                feeAccountAddress,
                usdcAddressSolanaChain,
                usdcRewardsPrivateKey,
            },
            birdeye: {
                baseUrl: 'https://public-api.birdeye.so',
                apiKey: birdeyeApiKey,
            },
            rugCheck: {
                baseUrl: 'https://api.rugcheck.xyz/v1',
                apiSolanaWalletPrivateKey: process.env.RUGCHECK_API_SOLANA_WALLET_PRIVATE_KEY,
            },
            solscan: {
                baseUrl: 'https://pro-api.solscan.io/v2.0',
                apiKey: solscanApiKey,
            },
            solintel: {
                baseUrl: 'https://api.solintel.io/api',
                apiKey: process.env.SOLINTEL_API_KEY,
            },
            shyft: {
                baseUrl: 'https://rpc.shyft.to',
                apiKey: shyftApiKey,
            },
            coingecko: {
                baseUrl: 'https://api.coingecko.com/api/v3',
            },
            jupiter: {
                baseUrl: 'https://quote-api.jup.ag/v6',
                priceUrl: 'https://price.jup.ag/v6',
            },
            jito: {
                baseUrl: 'https://mainnet.block-engine.jito.wtf/api/v1',
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
exports.configurationValidationSchema = Joi.object({
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
        mongo_db_url: Joi.string().required(),
    }).required(),
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
            usdcAddressSolanaChain: Joi.string().required(),
            feeAccountAddress: Joi.string().required(),
            usdcRewardsPrivateKey: Joi.string().required(),
        }).required(),
        ethereum: Joi.object({
            addressLength: Joi.number().required(),
            privateKeyLength: Joi.number().required(),
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
    POSTGRES_DATABASE_URL: Joi.string().required(),
    MONGO_DATABASE_URL: Joi.string().required(),
    BIRDEYE_API_KEY: Joi.string().required(),
    SOLANA_RPC_URL: Joi.string().required(),
    RUGCHECK_API_SOLANA_WALLET_PRIVATE_KEY: Joi.string().required().regex(/^[A-HJ-NP-Za-km-z1-9]{85,88}$/),
    PORT: Joi.number().optional(),
    SUBSCRIPTION_CHAT_ID: Joi.string().optional(),
    SUBSCRIPTION_INVITATION_LINK: Joi.string().uri().optional(),
    WHITELISTED_SUBSCRIPTION_TELEGRAM_IDS: Joi.string().optional().regex(/^(\d*(\s*,\s*)?)+$/),
    NEST_DEBUG: Joi.boolean().optional(),
    SOLINTEL_API_KEY: Joi.string().optional(),
    SHYFT_API_KEY: Joi.string().required(),
});
//# sourceMappingURL=configuration.js.map