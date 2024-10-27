"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeWizard = void 0;
var nestjs_telegraf_1 = require("nestjs-telegraf");
var common_1 = require("@nestjs/common");
var solana_utils_1 = require("../../solana/solana-utils");
var constants_1 = require("@shared/constants");
var node_util_1 = require("node:util");
var enums_1 = require("@shared/enums");
var class_validator_1 = require("class-validator");
var TradeWizard = function () {
    var _classDecorators = [(0, nestjs_telegraf_1.Wizard)('trade')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _requestTokenAddress_decorators;
    var _handleTokenAddress_decorators;
    var _close_decorators;
    var _minBuy_decorators;
    var _maxBuy_decorators;
    var _buy1Sol_decorators;
    var _buy2Sol_decorators;
    var _buy0_2Sol_decorators;
    var _askForValueForBuyXSol_decorators;
    var _sell25_decorators;
    var _sell50_decorators;
    var _sell100_decorators;
    var _sellInitial_decorators;
    var _handleUserReply_decorators;
    var _generatePnlImage_decorators;
    var TradeWizard = _classThis = /** @class */ (function () {
        function TradeWizard_1(i18n, markupButtonsService, utilsService, textService, solanaService, userService, settingsService, jupiterService, transactionService, referralService, rugCheckService, imageService) {
            this.i18n = (__runInitializers(this, _instanceExtraInitializers), i18n);
            this.markupButtonsService = markupButtonsService;
            this.utilsService = utilsService;
            this.textService = textService;
            this.solanaService = solanaService;
            this.userService = userService;
            this.settingsService = settingsService;
            this.jupiterService = jupiterService;
            this.transactionService = transactionService;
            this.referralService = referralService;
            this.rugCheckService = rugCheckService;
            this.imageService = imageService;
            this.logger = new common_1.Logger(this.constructor.name);
        }
        TradeWizard_1.prototype.requestTokenAddress = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var token, message, replyMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            token = ctx.scene.state.token;
                            if (!token) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.handleTokenAddress(ctx, token)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            message = this.i18n.translate('i18n.input_messages.solana_token');
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, message)];
                        case 3:
                            replyMessage = _a.sent();
                            this.logger.debug("replyMessage: ".concat((0, node_util_1.inspect)(replyMessage)));
                            this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
                            ctx.wizard.selectStep(1);
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.handleTokenAddress = function (ctx, token) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenAddress, errorMessage, validationResult, errorMessage, telegramId, user, settings, tradeDetails, transactionRecord, initialTokenAmount, tokenTemplate, walletTemplate, buttons, combinedTemplate, error_1, errorMessage;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            tokenAddress = typeof ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === 'string' ? ctx.message.text.trim() : ctx.scene.state.token;
                            this.logger.debug("Handling token address: ".concat(tokenAddress));
                            this.utilsService.saveState(ctx, { token: tokenAddress });
                            if (!(!tokenAddress || !(0, class_validator_1.isBase58)(tokenAddress))) return [3 /*break*/, 2];
                            errorMessage = this.i18n.translate('i18n.error_messages.invalid_solana_address');
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, errorMessage)];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                        case 2: return [4 /*yield*/, this.solanaService.validateSolanaTokenAddress(tokenAddress)];
                        case 3:
                            validationResult = _b.sent();
                            if (!validationResult.errorMessage) return [3 /*break*/, 7];
                            errorMessage = this.i18n.translate(validationResult.errorMessage);
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, errorMessage)];
                        case 4:
                            _b.sent();
                            if (!!token) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.requestTokenAddress(ctx)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [2 /*return*/];
                        case 7:
                            _b.trys.push([7, 14, , 18]);
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 8:
                            user = _b.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 9:
                            settings = _b.sent();
                            return [4 /*yield*/, this.getTradeDetails(tokenAddress, user, settings)];
                        case 10:
                            tradeDetails = _b.sent();
                            return [4 /*yield*/, this.transactionService.getInitialTransaction(user.id, tradeDetails.token_address)];
                        case 11:
                            transactionRecord = _b.sent();
                            initialTokenAmount = transactionRecord ? transactionRecord.amountTokens : '0';
                            tradeDetails.initial_token_amount = initialTokenAmount;
                            tokenTemplate = this.i18n.translate('i18n.menus.trading.token_info', { args: tradeDetails });
                            walletTemplate = this.i18n.translate('i18n.menus.trading.wallet_info', { args: tradeDetails });
                            return [4 /*yield*/, this.markupButtonsService.tradeButtons(settings, initialTokenAmount)];
                        case 12:
                            buttons = _b.sent();
                            combinedTemplate = "".concat(tokenTemplate, "\n\n").concat(walletTemplate);
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, combinedTemplate, buttons)];
                        case 13:
                            _b.sent();
                            ctx.wizard.next();
                            return [3 /*break*/, 18];
                        case 14:
                            error_1 = _b.sent();
                            this.logger.error("Error handling token address: ".concat(error_1.message));
                            errorMessage = this.i18n.translate('i18n.error_messages.solana_token_address_error');
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, errorMessage)];
                        case 15:
                            _b.sent();
                            if (!!token) return [3 /*break*/, 17];
                            return [4 /*yield*/, this.requestTokenAddress(ctx)];
                        case 16:
                            _b.sent();
                            _b.label = 17;
                        case 17: return [3 /*break*/, 18];
                        case 18: return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.close = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx.scene.state = {};
                            return [4 /*yield*/, ctx.deleteMessage()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, ctx.scene.leave()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.minBuy = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'min_buy', 'buy')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.maxBuy = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'max_buy', 'buy')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.buy1Sol = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'buy_1_sol', 'buy')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.buy2Sol = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'buy_2_sol', 'buy')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.buy0_2Sol = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'buy_0.2_sol', 'buy')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.askForValueForBuyXSol = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.input_messages.x_sol_buy');
                            return [4 /*yield*/, this.handleUserInput(ctx, 'buy_x_sol', message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.sell25 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'sell_25', 'sell')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.sell50 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'sell_50', 'sell')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.sell100 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'sell_100', 'sell')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.sellInitial = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processTransaction(ctx, 'sell_initial', 'sell')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.handleUserInput = function (ctx, actionType, promptMessage) {
            return __awaiter(this, void 0, void 0, function () {
                var message, replyMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.utilsService.saveState(ctx, { actionType: actionType });
                            message = this.i18n.translate('i18n.input_messages.prompt', { args: { promptMessage: promptMessage } });
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, message)];
                        case 1:
                            replyMessage = _a.sent();
                            this.utilsService.saveState(ctx, { replyMessageId: replyMessage.message_id });
                            ctx.wizard.selectStep(2);
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.handleUserReply = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var inputValue, _a, value, errorMessage, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.logger.debug("wizard 2 handleUserReply: ".concat((0, node_util_1.inspect)(ctx.message.text)));
                            inputValue = ctx.message.text.trim();
                            _a = this.utilsService.validatePositiveNumber(inputValue), value = _a.value, errorMessage = _a.errorMessage;
                            if (!errorMessage) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.i18n.translate(errorMessage)];
                        case 1:
                            _b.sent();
                            message = this.i18n.translate('i18n.input_messages.x_sol_buy');
                            return [4 /*yield*/, this.handleUserInput(ctx, 'buy_x_sol', message)];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            ctx.scene.state.amountSol = value;
                            return [4 /*yield*/, this.processTransaction(ctx, 'buy_x_sol', 'buy')];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.processTransaction = function (ctx, actionType, transactionType) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, user, fromSecretKey, settings, tradeDetails, amountLamportsToSwap, priorityFeeOption, inputTokenAddress, outputTokenAddress, wallet, developerFeeLamports, referralFeeLamports, adjustedAmountLamports, _b, txid, amountTokens, amountSol, solPriceInUsdc, tokenPriceInUsdc, pricePerToken, error_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prepareTransaction(ctx, actionType, transactionType)];
                        case 1:
                            _a = _c.sent(), user = _a.user, fromSecretKey = _a.fromSecretKey, settings = _a.settings, tradeDetails = _a.tradeDetails, amountLamportsToSwap = _a.amountLamportsToSwap, priorityFeeOption = _a.priorityFeeOption, inputTokenAddress = _a.inputTokenAddress, outputTokenAddress = _a.outputTokenAddress;
                            this.logger.debug("amountLamportsToSwap: ".concat(amountLamportsToSwap));
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 10, , 12]);
                            wallet = this.jupiterService.createWallet(fromSecretKey);
                            developerFeeLamports = this.calculateDeveloperFee(amountLamportsToSwap);
                            return [4 /*yield*/, this.calculateReferralFee(user.id, amountLamportsToSwap)];
                        case 3:
                            referralFeeLamports = _c.sent();
                            adjustedAmountLamports = amountLamportsToSwap - developerFeeLamports - referralFeeLamports;
                            return [4 /*yield*/, this.jupiterService.performSwap(wallet, inputTokenAddress, outputTokenAddress, adjustedAmountLamports, settings.slippage * 100, priorityFeeOption)];
                        case 4:
                            _b = _c.sent(), txid = _b.txid, amountTokens = _b.amountTokens, amountSol = _b.amountSol;
                            return [4 /*yield*/, this.jupiterService.getSolPriceInUsdc()];
                        case 5:
                            solPriceInUsdc = _c.sent();
                            return [4 /*yield*/, this.solanaService.getTokenPriceInUsdc(outputTokenAddress)];
                        case 6:
                            tokenPriceInUsdc = _c.sent();
                            pricePerToken = (parseFloat(amountTokens) * tokenPriceInUsdc).toString();
                            return [4 /*yield*/, this.transactionService.createTransactionIfNotExists(user.id, outputTokenAddress, txid, amountTokens, amountSol, pricePerToken, solPriceInUsdc.toString(), transactionType === 'buy')];
                        case 7:
                            _c.sent();
                            return [4 /*yield*/, this.recordReferralReward(user.id, referralFeeLamports, txid, pricePerToken, solPriceInUsdc.toString())];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, this.handleSuccessfulSwap(ctx, user.id, tradeDetails, txid, transactionType, amountTokens, amountSol, pricePerToken, solPriceInUsdc.toString())];
                        case 9:
                            _c.sent();
                            return [3 /*break*/, 12];
                        case 10:
                            error_2 = _c.sent();
                            return [4 /*yield*/, this.sendTransactionFailedMessage(ctx)];
                        case 11:
                            _c.sent();
                            return [3 /*break*/, 12];
                        case 12:
                            ctx.scene.state = {};
                            return [4 /*yield*/, ctx.scene.leave()];
                        case 13:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.prepareTransaction = function (ctx, actionType, transactionType) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, token, user, fromSecretKey, settings, tradeDetails, amountLamportsToSwap, priorityFeeOption, priorityFeeDetails, inputTokenAddress, outputTokenAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            token = ctx.scene.state.token;
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.userService.getUserSecretKey(user.id)];
                        case 2:
                            fromSecretKey = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 3:
                            settings = _a.sent();
                            return [4 /*yield*/, this.getTradeDetails(token, user, settings)];
                        case 4:
                            tradeDetails = _a.sent();
                            if (!(actionType === 'buy_x_sol')) return [3 /*break*/, 5];
                            this.logger.debug("Amount SOL to buy: ".concat(ctx.scene.state.amountSol));
                            amountLamportsToSwap = solana_utils_1.SolanaUtils.solToLamports(ctx.scene.state.amountSol);
                            return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, this.calculateAmountLamportsToSwap(actionType, transactionType, fromSecretKey, token, user.walletAddress, tradeDetails)];
                        case 6:
                            amountLamportsToSwap = _a.sent();
                            _a.label = 7;
                        case 7:
                            priorityFeeOption = this.utilsService.mapNumberToPriorityFeeOption(settings.priorityFee);
                            priorityFeeDetails = this.utilsService.getPriorityFeeDetails(priorityFeeOption);
                            inputTokenAddress = transactionType === 'buy' ? constants_1.default.solana.tokens.sol_token_address : tradeDetails.token_address;
                            outputTokenAddress = transactionType === 'buy' ? tradeDetails.token_address : constants_1.default.solana.tokens.sol_token_address;
                            return [2 /*return*/, {
                                    telegramId: telegramId,
                                    token: token,
                                    user: user,
                                    fromSecretKey: fromSecretKey,
                                    settings: settings,
                                    tradeDetails: tradeDetails,
                                    amountLamportsToSwap: amountLamportsToSwap,
                                    priorityFeeOption: priorityFeeOption,
                                    priorityFeeDetails: priorityFeeDetails,
                                    inputTokenAddress: inputTokenAddress,
                                    outputTokenAddress: outputTokenAddress,
                                }];
                    }
                });
            });
        };
        TradeWizard_1.prototype.calculateAmountLamportsToSwap = function (actionType, transactionType, fromSecretKey, token, walletAddress, tradeDetails) {
            return __awaiter(this, void 0, void 0, function () {
                var buyAction, amountSol, amountToSwap, sellAction, fromKeypair, userTokenAccount, tokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(transactionType === 'buy')) return [3 /*break*/, 1];
                            buyAction = actionType;
                            amountSol = buyAction === enums_1.BuyActions.BuyXSol ? tradeDetails.amountSol : undefined;
                            amountToSwap = this.getBuyAmount(buyAction, tradeDetails, amountSol);
                            return [2 /*return*/, solana_utils_1.SolanaUtils.solToLamports(amountToSwap)];
                        case 1:
                            sellAction = actionType;
                            fromKeypair = this.solanaService.keypairFromSecretKeyString(fromSecretKey);
                            return [4 /*yield*/, this.solanaService.getOrCreateTokenAccount(fromKeypair, token, walletAddress)];
                        case 2:
                            userTokenAccount = _a.sent();
                            return [4 /*yield*/, this.solanaService.getTokenBalance(userTokenAccount)];
                        case 3:
                            tokenBalance = _a.sent();
                            return [2 /*return*/, this.getSellAmount(sellAction, tradeDetails, tokenBalance)];
                    }
                });
            });
        };
        TradeWizard_1.prototype.getSellAmount = function (actionType, tradeDetails, tokenBalance) {
            switch (actionType) {
                case enums_1.SellActions.Sell10:
                    return Math.floor(tokenBalance * 0.1);
                case enums_1.SellActions.Sell25:
                    return Math.floor(tokenBalance * 0.25);
                case enums_1.SellActions.Sell100:
                    return Math.floor(tokenBalance);
                case enums_1.SellActions.SellInitial:
                    return Math.floor(parseFloat(tradeDetails.initial_token_amount));
                default:
                    throw new Error("Unknown action type: ".concat(actionType));
            }
        };
        TradeWizard_1.prototype.getBuyAmount = function (actionType, tradeDetails, amountSol) {
            switch (actionType) {
                case enums_1.BuyActions.MinBuy:
                    return parseFloat(tradeDetails.min_buy);
                case enums_1.BuyActions.MaxBuy:
                    return parseFloat(tradeDetails.max_buy);
                case enums_1.BuyActions.Buy1Sol:
                    return 1.0;
                case enums_1.BuyActions.Buy2Sol:
                    return 2.0;
                case enums_1.BuyActions.Buy0_2Sol:
                    return 0.2;
                case enums_1.BuyActions.BuyXSol:
                    return parseFloat(amountSol || '0');
                default:
                    throw new Error("Unknown action type: ".concat(actionType));
            }
        };
        TradeWizard_1.prototype.createTradeDetails = function (token, user, settings, tokenMetadata, balanceInSol, balanceInUsdc, tokenBalance, tokenPriceInUsdc, tokenBalanceInUsdc, solPriceInUsdc, twitter, telegram, website, freezeStatus, mintStatus, decimals, supply, tokenAge, liquidity, liquidityLock, top10OwnershipPercentage, devTokenBalance) {
            return __awaiter(this, void 0, void 0, function () {
                var walletAddress, minBuy, maxBuy, slippage, priorityFee, priorityFeeEnum, priorityText, formattedSupply, marketCap, creatorWallet, creatorPercentage, tradeDetails;
                return __generator(this, function (_a) {
                    walletAddress = user.walletAddress;
                    minBuy = settings.minBuy, maxBuy = settings.maxBuy, slippage = settings.slippage, priorityFee = settings.priorityFee;
                    priorityFeeEnum = this.utilsService.mapNumberToPriorityFeeOption(priorityFee);
                    priorityText = this.utilsService.getPriorityFeeDetails(priorityFeeEnum, priorityFee).text;
                    formattedSupply = this.utilsService.formatLargeNumber(parseInt(supply) / Math.pow(10, parseInt(decimals)));
                    marketCap = parseFloat((tokenPriceInUsdc * (parseInt(supply) / Math.pow(10, parseInt(decimals)))).toFixed(3));
                    creatorWallet = tokenMetadata.updateAuthorityAddress;
                    creatorPercentage = ((devTokenBalance / parseInt(supply)) * 100).toFixed(2);
                    tradeDetails = {
                        token_address: token,
                        balanceSolInSol: balanceInSol,
                        balanceSolInUsdc: balanceInUsdc,
                        balanceTokensInSol: (tokenBalance === null || tokenBalance === void 0 ? void 0 : tokenBalance.toString()) || '0',
                        balanceTokensInUsdc: tokenBalanceInUsdc || '0',
                        wallet_address: walletAddress,
                        mint_status: mintStatus,
                        pnl: '0',
                        wallet_token_amount: (tokenBalance === null || tokenBalance === void 0 ? void 0 : tokenBalance.toString()) || '0',
                        slippage: (slippage === null || slippage === void 0 ? void 0 : slippage.toString()) || '0',
                        min_buy: (minBuy === null || minBuy === void 0 ? void 0 : minBuy.toString()) || '0',
                        max_buy: (maxBuy === null || maxBuy === void 0 ? void 0 : maxBuy.toString()) || '0',
                        priority: priorityText || '',
                        priorityFee: (priorityFee === null || priorityFee === void 0 ? void 0 : priorityFee.toString()) || '0',
                        solPriceInUsdc: solPriceInUsdc ? solPriceInUsdc.toFixed(2) : '0.00',
                        pricePerToken: (tokenPriceInUsdc === null || tokenPriceInUsdc === void 0 ? void 0 : tokenPriceInUsdc.toString()) || '0',
                        token_name: tokenMetadata.name || '',
                        token_symbol: tokenMetadata.symbol || '',
                        token_description: tokenMetadata.json.description || '',
                        token_image: tokenMetadata.json.image || '',
                        seller_fee_basis_points: tokenMetadata.sellerFeeBasisPoints || 0,
                        is_mutable: tokenMetadata.isMutable || false,
                        primary_sale_happened: tokenMetadata.primarySaleHappened || false,
                        twitter: twitter || 'twitter ❌',
                        telegram: telegram || 'telegram ❌',
                        website: website || 'website ❌',
                        freeze_status: freezeStatus || '❌',
                        decimals: (decimals === null || decimals === void 0 ? void 0 : decimals.toString()) || '0',
                        supply: formattedSupply.toString(),
                        age: tokenAge || '',
                        liquidity: liquidity ? parseFloat(liquidity.toFixed(2)).toString() : '0.00',
                        liquidity_lock: liquidityLock.toFixed(2) + '%',
                        top_10_ownership_percentage: top10OwnershipPercentage ? top10OwnershipPercentage.toFixed(2) + '%' : '0.00%',
                        market_cap: marketCap,
                        creator_wallet: creatorWallet,
                        creator_percentage: creatorPercentage,
                    };
                    return [2 /*return*/, tradeDetails];
                });
            });
        };
        TradeWizard_1.prototype.fetchTokenDetails = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenMetadata, twitter, telegram, website, freezeStatus, mintStatus, decimals, supply, tokenAge, liquidityDetails, liquidity, liquidityLock, top10OwnershipPercentage, devTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.solanaService.getTokenMetadata(token)];
                        case 1:
                            tokenMetadata = _a.sent();
                            twitter = tokenMetadata.json.twitter ? "<a href=\"".concat(tokenMetadata.json.twitter, "\">Twitter</a>") : 'Twitter 🔴';
                            telegram = tokenMetadata.json.telegram ? "<a href=\"".concat(tokenMetadata.json.telegram, "\">Telegram</a>") : 'Telegram 🔴';
                            website = tokenMetadata.json.website ? "<a href=\"".concat(tokenMetadata.json.website, "\">Website</a>") : 'Website 🔴';
                            freezeStatus = tokenMetadata.mint.freezeAuthorityAddress ? '🧊' : '❌';
                            mintStatus = tokenMetadata.mint.mintAuthorityAddress ? "".concat(tokenMetadata.mint.mintAuthorityAddress) : '🟢';
                            decimals = tokenMetadata.mint.decimals.toString();
                            supply = tokenMetadata.mint.supply.basisPoints.toString();
                            return [4 /*yield*/, this.rugCheckService.getTokenAge(token)];
                        case 2:
                            tokenAge = _a.sent();
                            return [4 /*yield*/, this.rugCheckService.getLiquidityAndLiquidityLock(token)];
                        case 3:
                            liquidityDetails = _a.sent();
                            liquidity = liquidityDetails.liquidity;
                            liquidityLock = liquidityDetails.lpUnlockedPct;
                            return [4 /*yield*/, this.rugCheckService.getTop10OwnershipPercentage(token)];
                        case 4:
                            top10OwnershipPercentage = _a.sent();
                            return [4 /*yield*/, this.solanaService.getUserTokenBalance(token, tokenMetadata.updateAuthorityAddress)];
                        case 5:
                            devTokenBalance = _a.sent();
                            this.logger.log("Token Metadata received: ".concat((0, node_util_1.inspect)(tokenMetadata, { depth: null, colors: true })));
                            this.logger.log("RugCheck Data - liquidity: ".concat(liquidity, ", Liquidity Lock: ").concat(liquidityLock, ", Top 10 Ownership Percentage: ").concat(top10OwnershipPercentage));
                            return [2 /*return*/, {
                                    tokenMetadata: tokenMetadata,
                                    twitter: twitter,
                                    telegram: telegram,
                                    website: website,
                                    freezeStatus: freezeStatus,
                                    mintStatus: mintStatus,
                                    decimals: decimals,
                                    supply: supply,
                                    tokenAge: tokenAge,
                                    liquidity: liquidity,
                                    liquidityLock: liquidityLock,
                                    top10OwnershipPercentage: top10OwnershipPercentage,
                                    devTokenBalance: devTokenBalance,
                                }];
                    }
                });
            });
        };
        TradeWizard_1.prototype.fetchWalletDetails = function (user, token) {
            return __awaiter(this, void 0, void 0, function () {
                var balanceInLamports, balanceInSol, solPriceInUsdc, balanceInUsdc, fromKeypair, _a, _b, userTokenAccount, tokenBalance, tokenPriceInUsdc, tokenBalanceInUsdc;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.solanaService.getBalance(user.walletAddress)];
                        case 1:
                            balanceInLamports = _c.sent();
                            balanceInSol = solana_utils_1.SolanaUtils.lamportsToSol(balanceInLamports).toFixed(3);
                            return [4 /*yield*/, this.jupiterService.getSolPriceInUsdc()];
                        case 2:
                            solPriceInUsdc = _c.sent();
                            balanceInUsdc = (parseFloat(balanceInSol) * solPriceInUsdc).toFixed(2);
                            _b = (_a = this.solanaService).keypairFromSecretKeyString;
                            return [4 /*yield*/, this.userService.getUserSecretKey(user.id)];
                        case 3:
                            fromKeypair = _b.apply(_a, [_c.sent()]);
                            return [4 /*yield*/, this.solanaService.getOrCreateTokenAccount(fromKeypair, token, user.walletAddress)];
                        case 4:
                            userTokenAccount = _c.sent();
                            return [4 /*yield*/, this.solanaService.getTokenBalance(userTokenAccount)];
                        case 5:
                            tokenBalance = _c.sent();
                            return [4 /*yield*/, this.solanaService.getTokenPriceInUsdc(token)];
                        case 6:
                            tokenPriceInUsdc = _c.sent();
                            tokenBalanceInUsdc = (parseFloat(tokenBalance.toString()) * tokenPriceInUsdc).toFixed(2);
                            return [2 /*return*/, {
                                    balanceInSol: balanceInSol,
                                    balanceInUsdc: balanceInUsdc,
                                    tokenBalance: tokenBalance,
                                    tokenPriceInUsdc: tokenPriceInUsdc,
                                    tokenBalanceInUsdc: tokenBalanceInUsdc,
                                    solPriceInUsdc: solPriceInUsdc,
                                }];
                    }
                });
            });
        };
        TradeWizard_1.prototype.getTradeDetails = function (token, user, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenDetails, walletDetails;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.fetchTokenDetails(token)];
                        case 1:
                            tokenDetails = _a.sent();
                            return [4 /*yield*/, this.fetchWalletDetails(user, token)];
                        case 2:
                            walletDetails = _a.sent();
                            return [2 /*return*/, this.createTradeDetails(token, user, settings, tokenDetails.tokenMetadata, walletDetails.balanceInSol, walletDetails.balanceInUsdc, walletDetails.tokenBalance, walletDetails.tokenPriceInUsdc, walletDetails.tokenBalanceInUsdc, walletDetails.solPriceInUsdc, tokenDetails.twitter, tokenDetails.telegram, tokenDetails.website, tokenDetails.freezeStatus, tokenDetails.mintStatus, tokenDetails.decimals, tokenDetails.supply, tokenDetails.tokenAge, tokenDetails.liquidity, tokenDetails.liquidityLock, tokenDetails.top10OwnershipPercentage, tokenDetails.devTokenBalance)];
                    }
                });
            });
        };
        TradeWizard_1.prototype.handleSuccessfulSwap = function (ctx, userId, tradeDetails, transactionHash, transactionType, amountTokens, amountSol, pricePerToken, solPriceInUsdc) {
            return __awaiter(this, void 0, void 0, function () {
                var isInitial, existingInitialTransaction, initialSolAmount, swapAmountTokens, swapAmountSOL, transactionDetails, actualAmountSwapped;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isInitial = transactionType === 'buy';
                            if (!isInitial) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.transactionService.getInitialTransaction(userId, tradeDetails.token_address)];
                        case 1:
                            existingInitialTransaction = _a.sent();
                            if (!!existingInitialTransaction) return [3 /*break*/, 3];
                            initialSolAmount = parseFloat(tradeDetails.min_buy);
                            return [4 /*yield*/, this.transactionService.createInitialTokenPurchase(userId, tradeDetails.token_address, transactionHash, parseFloat(tradeDetails.max_buy), initialSolAmount, pricePerToken, solPriceInUsdc)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            swapAmountTokens = parseFloat(amountTokens);
                            swapAmountSOL = solana_utils_1.SolanaUtils.solToLamports(parseFloat(amountSol));
                            transactionDetails = solana_utils_1.SolanaUtils.createTransactionDetails(transactionHash, tradeDetails.wallet_address, tradeDetails.token_address, transactionType, swapAmountTokens, swapAmountSOL);
                            actualAmountSwapped = transactionType === 'buy' ? swapAmountTokens : swapAmountSOL;
                            return [4 /*yield*/, this.sendTransactionSuccessMessage(ctx, transactionDetails, tradeDetails.pnl, transactionType, actualAmountSwapped)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.sendTransactionSuccessMessage = function (ctx, transactionDetails, pnl, transactionType, actualAmountSwapped) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.menus.solana.transaction_swap_success', {
                                args: {
                                    solana: {
                                        transactionHash: transactionDetails.transactionHash,
                                        from: transactionDetails.from,
                                        to: transactionDetails.to,
                                        amountTokens: transactionType === 'buy'
                                            ? actualAmountSwapped
                                            : transactionDetails.amountTokens,
                                        amountSOL: transactionType === 'buy'
                                            ? solana_utils_1.SolanaUtils.lamportsToSol(transactionDetails.amountSOL).toFixed(4)
                                            : actualAmountSwapped,
                                        transactionType: transactionDetails.transactionType,
                                        solanaScanUrl: transactionDetails.solanaScanUrl,
                                        pnl: pnl,
                                    },
                                },
                            });
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.sendTransactionFailedMessage = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.error_messages.solana_swap_error');
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.recordReferralReward = function (userId, referralReward, transactionHash, pricePerToken, solPriceInUsdc) {
            return __awaiter(this, void 0, void 0, function () {
                var inviter, amountSol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.referralService.getInviter(userId)];
                        case 1:
                            inviter = _a.sent();
                            if (!inviter) return [3 /*break*/, 3];
                            amountSol = solana_utils_1.SolanaUtils.lamportsToSol(referralReward).toString();
                            return [4 /*yield*/, this.transactionService.createTransactionIfNotExists(inviter.id, 'referral_reward', transactionHash, referralReward.toString(), amountSol, pricePerToken, solPriceInUsdc, false)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        TradeWizard_1.prototype.calculateDeveloperFee = function (amountLamports) {
            return Math.floor(amountLamports * 0.01);
        };
        TradeWizard_1.prototype.calculateReferralFee = function (userId, amountLamports) {
            return __awaiter(this, void 0, void 0, function () {
                var inviter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.referralService.getInviter(userId)];
                        case 1:
                            inviter = _a.sent();
                            return [2 /*return*/, inviter ? Math.floor(amountLamports * 0.025) : 0];
                    }
                });
            });
        };
        //@ts-ignore
        TradeWizard_1.prototype.generatePnlImage = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = {
                                name: 'Example Token',
                                investedAmountUSD: 1000,
                                investedAmountSOL: 1.5,
                                multiplier: 7.83,
                                profitUSD: 7830,
                                profitSOL: 11.745,
                            };
                            return [4 /*yield*/, this.imageService.createTradeImage(data)];
                        case 1:
                            buffer = _a.sent();
                            return [4 /*yield*/, ctx.replyWithPhoto({ source: buffer })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return TradeWizard_1;
    }());
    __setFunctionName(_classThis, "TradeWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _requestTokenAddress_decorators = [(0, nestjs_telegraf_1.WizardStep)(0)];
        _handleTokenAddress_decorators = [(0, nestjs_telegraf_1.WizardStep)(1)];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        _minBuy_decorators = [(0, nestjs_telegraf_1.Action)('min_buy')];
        _maxBuy_decorators = [(0, nestjs_telegraf_1.Action)('max_buy')];
        _buy1Sol_decorators = [(0, nestjs_telegraf_1.Action)('buy_1_sol')];
        _buy2Sol_decorators = [(0, nestjs_telegraf_1.Action)('buy_2_sol')];
        _buy0_2Sol_decorators = [(0, nestjs_telegraf_1.Action)('buy_0.2_sol')];
        _askForValueForBuyXSol_decorators = [(0, nestjs_telegraf_1.Action)('buy_x_sol')];
        _sell25_decorators = [(0, nestjs_telegraf_1.Action)('sell_25')];
        _sell50_decorators = [(0, nestjs_telegraf_1.Action)('sell_50')];
        _sell100_decorators = [(0, nestjs_telegraf_1.Action)('sell_100')];
        _sellInitial_decorators = [(0, nestjs_telegraf_1.Action)('sell_initial')];
        _handleUserReply_decorators = [(0, nestjs_telegraf_1.WizardStep)(2)];
        _generatePnlImage_decorators = [(0, nestjs_telegraf_1.Action)('generate_pnl')];
        __esDecorate(_classThis, null, _requestTokenAddress_decorators, { kind: "method", name: "requestTokenAddress", static: false, private: false, access: { has: function (obj) { return "requestTokenAddress" in obj; }, get: function (obj) { return obj.requestTokenAddress; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleTokenAddress_decorators, { kind: "method", name: "handleTokenAddress", static: false, private: false, access: { has: function (obj) { return "handleTokenAddress" in obj; }, get: function (obj) { return obj.handleTokenAddress; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _minBuy_decorators, { kind: "method", name: "minBuy", static: false, private: false, access: { has: function (obj) { return "minBuy" in obj; }, get: function (obj) { return obj.minBuy; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _maxBuy_decorators, { kind: "method", name: "maxBuy", static: false, private: false, access: { has: function (obj) { return "maxBuy" in obj; }, get: function (obj) { return obj.maxBuy; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _buy1Sol_decorators, { kind: "method", name: "buy1Sol", static: false, private: false, access: { has: function (obj) { return "buy1Sol" in obj; }, get: function (obj) { return obj.buy1Sol; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _buy2Sol_decorators, { kind: "method", name: "buy2Sol", static: false, private: false, access: { has: function (obj) { return "buy2Sol" in obj; }, get: function (obj) { return obj.buy2Sol; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _buy0_2Sol_decorators, { kind: "method", name: "buy0_2Sol", static: false, private: false, access: { has: function (obj) { return "buy0_2Sol" in obj; }, get: function (obj) { return obj.buy0_2Sol; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForValueForBuyXSol_decorators, { kind: "method", name: "askForValueForBuyXSol", static: false, private: false, access: { has: function (obj) { return "askForValueForBuyXSol" in obj; }, get: function (obj) { return obj.askForValueForBuyXSol; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sell25_decorators, { kind: "method", name: "sell25", static: false, private: false, access: { has: function (obj) { return "sell25" in obj; }, get: function (obj) { return obj.sell25; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sell50_decorators, { kind: "method", name: "sell50", static: false, private: false, access: { has: function (obj) { return "sell50" in obj; }, get: function (obj) { return obj.sell50; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sell100_decorators, { kind: "method", name: "sell100", static: false, private: false, access: { has: function (obj) { return "sell100" in obj; }, get: function (obj) { return obj.sell100; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sellInitial_decorators, { kind: "method", name: "sellInitial", static: false, private: false, access: { has: function (obj) { return "sellInitial" in obj; }, get: function (obj) { return obj.sellInitial; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleUserReply_decorators, { kind: "method", name: "handleUserReply", static: false, private: false, access: { has: function (obj) { return "handleUserReply" in obj; }, get: function (obj) { return obj.handleUserReply; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generatePnlImage_decorators, { kind: "method", name: "generatePnlImage", static: false, private: false, access: { has: function (obj) { return "generatePnlImage" in obj; }, get: function (obj) { return obj.generatePnlImage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TradeWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TradeWizard = _classThis;
}();
exports.TradeWizard = TradeWizard;
