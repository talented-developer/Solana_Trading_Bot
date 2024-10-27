"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
var common_1 = require("@nestjs/common");
var nestjs_telegraf_1 = require("nestjs-telegraf");
var bot_update_1 = require("./bot.update");
var button_service_1 = require("./service/button.service");
var config_1 = require("@nestjs/config");
var bot_service_1 = require("./bot.service");
var prisma_module_1 = require("@db/prisma.module");
var telegraf_1 = require("telegraf");
var settings_scene_1 = require("./scenes/settings.scene");
var help_scene_1 = require("./scenes/help.scene");
var start_scene_1 = require("./scenes/start.scene");
var calls_scene_1 = require("./scenes/calls.scene");
var utils_service_1 = require("./service/utils.service");
var wallet_scene_1 = require("./scenes/wallet.scene");
var referral_scene_1 = require("./scenes/referral.scene");
var plan_scene_1 = require("./scenes/plan.scene");
var solana_service_1 = require("../solana/solana.service");
var referral_service_1 = require("@db/referral.service");
var user_service_1 = require("@db/user.service");
var settings_service_1 = require("@db/settings.service");
var text_service_1 = require("./service/text.service");
var subscription_service_1 = require("@db/subscription.service");
var trade_scene_1 = require("./scenes/trade.scene");
var raydium_service_1 = require("../solana/raydium/raydium.service");
var jupiter_service_1 = require("../solana/jupiter/jupiter.service");
var transaction_service_1 = require("@db/transaction.service");
var jupiterAPI_1 = require("../solana/jupiter/jupiterAPI");
var claim_service_1 = require("@db/claim.service");
var portfolio_scene_1 = require("./scenes/portfolio.scene");
var coingecko_service_1 = require("../solana/coingecko/coingecko.service");
var token_filter_service_1 = require("./service/token-filter.service");
var rugCheckApi_service_1 = require("../solana/rug-check-api/rugCheckApi.service");
var mongoose_1 = require("@nestjs/mongoose");
var valid_token_schema_1 = require("../token-filter/schemas/valid-token.schema/valid-token.schema");
var user_filter_service_1 = require("./service/user-filter.service");
var image_service_1 = require("./service/image.service");
var TelegramModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot(),
                mongoose_1.MongooseModule.forFeature([{ name: valid_token_schema_1.ValidToken.name, schema: valid_token_schema_1.ValidTokenSchema }]),
                nestjs_telegraf_1.TelegrafModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) { return ({
                        token: configService.get('telegram.bot.token'),
                        middlewares: [(0, telegraf_1.session)()],
                    }); },
                }),
                prisma_module_1.PrismaModule,
            ],
            providers: [
                bot_update_1.BotUpdate,
                trade_scene_1.TradeWizard,
                button_service_1.MarkupButtonsService,
                bot_service_1.BotService,
                token_filter_service_1.TokenFilterService,
                user_filter_service_1.UserFilterService,
                utils_service_1.UtilsService,
                solana_service_1.SolanaService,
                text_service_1.TextService,
                claim_service_1.ClaimService,
                portfolio_scene_1.PortfolioScene,
                rugCheckApi_service_1.RugCheckApiService,
                image_service_1.ImageService,
                jupiterAPI_1.JupiterAPI,
                jupiter_service_1.JupiterService,
                calls_scene_1.GlobalValidationWizard,
                calls_scene_1.AlgoraCallWizard,
                subscription_service_1.SubscriptionService,
                user_service_1.UserService,
                coingecko_service_1.CoingeckoService,
                settings_service_1.SettingsService,
                referral_service_1.ReferralService,
                raydium_service_1.RaydiumService,
                transaction_service_1.TransactionService,
                referral_scene_1.ReferralWizard,
                plan_scene_1.PlanWizard,
                wallet_scene_1.WalletWizard,
                start_scene_1.StartWizard,
                settings_scene_1.SettingsWizard,
                help_scene_1.HelpWizard,
            ],
            exports: [
                bot_service_1.BotService,
                mongoose_1.MongooseModule,
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TelegramModule = _classThis = /** @class */ (function () {
        function TelegramModule_1() {
        }
        return TelegramModule_1;
    }());
    __setFunctionName(_classThis, "TelegramModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TelegramModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TelegramModule = _classThis;
}();
exports.TelegramModule = TelegramModule;
