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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var telegram_module_1 = require("./telegram/telegram.module");
var nestjs_i18n_1 = require("nestjs-i18n");
var configuration_1 = require("../config/configuration");
var solana_module_1 = require("./solana/solana.module");
var prisma_module_1 = require("@db/prisma.module");
var axios_1 = require("@nestjs/axios");
var cache_manager_1 = require("@nestjs/cache-manager");
var token_filter_module_1 = require("./token-filter/token-filter.module");
var mongoose_1 = require("@nestjs/mongoose");
var valid_token_schema_1 = require("./token-filter/schemas/valid-token.schema/valid-token.schema");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    envFilePath: ".env.".concat(process.env.NODE_ENV || 'development'),
                    cache: true,
                    isGlobal: true,
                    load: [configuration_1.default],
                    validationSchema: configuration_1.configurationValidationSchema,
                }),
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) { return ({
                        uri: configService.get('database.mongo_db_url'),
                    }); },
                }),
                mongoose_1.MongooseModule.forFeature([{ name: valid_token_schema_1.ValidToken.name, schema: valid_token_schema_1.ValidTokenSchema }]),
                cache_manager_1.CacheModule.register({
                    isGlobal: true,
                    ttl: 5 * 60 * 1000, // 5 mins
                }),
                nestjs_i18n_1.I18nModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (configService) { return ({
                        fallbackLanguage: configService.get('telegram.i18n.fallbackLanguage'),
                        loaderOptions: { path: configService.get('telegram.i18n.i18nFolderPath') },
                    }); },
                    resolvers: [
                        { use: nestjs_i18n_1.QueryResolver, options: ['lang'] },
                        nestjs_i18n_1.AcceptLanguageResolver,
                        new nestjs_i18n_1.HeaderResolver(['x-lang']),
                    ],
                }),
                solana_module_1.SolanaModule,
                prisma_module_1.PrismaModule,
                telegram_module_1.TelegramModule,
                axios_1.HttpModule,
                token_filter_module_1.TokenFilterModule,
            ],
            controllers: [],
            providers: [],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
            var logger = new common_1.Logger(AppModule.name);
            logger.log("Node environment: ".concat(process.env.NODE_ENV));
        }
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
