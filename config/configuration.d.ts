import * as Joi from 'joi';
declare const _default: () => {
    telegram: {
        bot: {
            token: string;
            subscriptionChatId: number;
            subscriptionInvitationLink: string;
            blockchainNetworkDisplayName: string;
            referralStringLength: number;
            whitelistedTelegramIds: Set<number>;
            providerToken: string;
        };
        i18n: {
            fallbackLanguage: string;
            i18nFolderPath: string;
        };
    };
    database: {
        postgres_db_url: string;
        mongo_db_url: string;
    };
    blockchain: {
        solana: {
            addressLengthMin: number;
            addressLengthMax: number;
            privateKeyLengthMin: number;
            privateKeyLengthMax: number;
            addressRegex: RegExp;
            privateKeyRegex: RegExp;
            rpcUrl: string;
            solanaInvoiceWalletAddress: string;
            feeAccountAddress: string;
            usdcAddressSolanaChain: string;
            usdcRewardsPrivateKey: string;
        };
        birdeye: {
            baseUrl: string;
            apiKey: string;
        };
        rugCheck: {
            baseUrl: string;
            apiSolanaWalletPrivateKey: string;
        };
        solscan: {
            baseUrl: string;
            apiKey: string;
        };
        solintel: {
            baseUrl: string;
            apiKey: string;
        };
        shyft: {
            baseUrl: string;
            apiKey: string;
        };
        coingecko: {
            baseUrl: string;
        };
        jupiter: {
            baseUrl: string;
            priceUrl: string;
        };
        jito: {
            baseUrl: string;
        };
        ethereum: {
            addressLength: number;
            privateKeyLength: number;
        };
        ton: {};
    };
    heroku: {
        hostname: string;
        port: number;
    };
};
export default _default;
export declare const configurationValidationSchema: Joi.ObjectSchema<any>;
