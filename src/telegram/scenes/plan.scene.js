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
exports.PlanWizard = void 0;
var common_1 = require("@nestjs/common");
var nestjs_telegraf_1 = require("nestjs-telegraf");
var enums_1 = require("@shared/enums");
var solana_utils_1 = require("../../solana/solana-utils");
var PlanWizard = function () {
    var _classDecorators = [(0, nestjs_telegraf_1.Wizard)('plan')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handlePlanScene_decorators;
    var _confirmSubscription_decorators;
    var _handleConfirmPayment_decorators;
    var _handleCancelPayment_decorators;
    var _handleBronzePlan_decorators;
    var _handleSilverPlan_decorators;
    var _handleGoldPlan_decorators;
    var _close_decorators;
    var _cancel_decorators;
    var PlanWizard = _classThis = /** @class */ (function () {
        function PlanWizard_1(i18n, subscriptionService, markupButtonsService, textService, configService, solanaService, userService, utilsService) {
            this.i18n = (__runInitializers(this, _instanceExtraInitializers), i18n);
            this.subscriptionService = subscriptionService;
            this.markupButtonsService = markupButtonsService;
            this.textService = textService;
            this.configService = configService;
            this.solanaService = solanaService;
            this.userService = userService;
            this.utilsService = utilsService;
            this.logger = new common_1.Logger(PlanWizard.name);
            this.solanaInvoiceWalletAddress = this.configService.get('blockchain.solana.solanaInvoiceWalletAddress');
        }
        PlanWizard_1.prototype.createNewSubscription = function (userId, plan, amountUSDC, transactionHash) {
            return __awaiter(this, void 0, void 0, function () {
                var amountUSDCinLamports;
                return __generator(this, function (_a) {
                    this.logger.log("Creating subscription for user ID: ".concat(userId, " with plan: ").concat(plan, " and amount: ").concat(amountUSDC));
                    amountUSDCinLamports = solana_utils_1.SolanaUtils.solToLamports(amountUSDC);
                    return [2 /*return*/, this.subscriptionService.createSubscription(userId, plan, amountUSDCinLamports, transactionHash)];
                });
            });
        };
        PlanWizard_1.prototype.sendTransactionSuccessMessage = function (ctx, transactionDetails) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.debug('Sending transaction success message');
                            message = this.i18n.translate('i18n.menus.solana.transaction_subscription_success', {
                                args: { solana: transactionDetails },
                            });
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.sendTransactionFailedMessage = function (ctx, error) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.error_messages.transaction_failed_error', {
                                args: { error: error },
                            });
                            return [4 /*yield*/, ctx.reply(message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.sendPlanMenuMessage = function (ctx, currentPlan, remainingTime) {
            return __awaiter(this, void 0, void 0, function () {
                var message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.menus.plan.main_message', {
                                args: { currentPlan: currentPlan, expirationDate: remainingTime },
                            });
                            return [4 /*yield*/, this.markupButtonsService.planMenuButtons()];
                        case 1:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.sendInvoiceConfirmationMessage = function (ctx, plan, amount) {
            return __awaiter(this, void 0, void 0, function () {
                var message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate("i18n.menus.plan.confirmation.".concat(plan.toLowerCase(), "_invoice_confirmation"), {
                                args: { amountToSend: amount },
                            });
                            return [4 /*yield*/, this.markupButtonsService.invoiceConfirmationButtons()];
                        case 1:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.confirmSubscriptionTransaction = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, plan, amountUSDC, user, _a, isActive, subscription, fromSecretKey, transactionHash, transactionDetails, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            plan = ctx.scene.state.plan;
                            amountUSDC = enums_1.SubscriptionPlanAmount[plan];
                            this.logger.debug("amountUSDC: ".concat(amountUSDC));
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, 10, 12]);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 2:
                            user = _b.sent();
                            return [4 /*yield*/, this.subscriptionService.checkSubscriptionStatus(user.id)];
                        case 3:
                            _a = _b.sent(), isActive = _a.isActive, subscription = _a.subscription;
                            if (isActive) {
                                throw new Error('You already have an active subscription.');
                            }
                            return [4 /*yield*/, this.userService.getUserSecretKey(user.id)];
                        case 4:
                            fromSecretKey = _b.sent();
                            return [4 /*yield*/, this.solanaService.sendUSDCWithKey(fromSecretKey, this.solanaInvoiceWalletAddress, solana_utils_1.SolanaUtils.solToLamports(amountUSDC) / 1000)];
                        case 5:
                            transactionHash = _b.sent();
                            transactionDetails = solana_utils_1.SolanaUtils.createTransactionDetails(transactionHash, user.walletAddress, this.solanaInvoiceWalletAddress, "subscription ".concat(plan), amountUSDC, 0);
                            return [4 /*yield*/, this.createNewSubscription(user.id, plan, amountUSDC, transactionHash)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, this.sendTransactionSuccessMessage(ctx, transactionDetails)];
                        case 7:
                            _b.sent();
                            return [3 /*break*/, 12];
                        case 8:
                            error_1 = _b.sent();
                            this.logger.error("Transaction failed: ".concat(error_1.message));
                            return [4 /*yield*/, this.sendTransactionFailedMessage(ctx, error_1)];
                        case 9:
                            _b.sent();
                            return [3 /*break*/, 12];
                        case 10: return [4 /*yield*/, ctx.scene.leave()];
                        case 11:
                            _b.sent();
                            return [7 /*endfinally*/];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.handlePlanScene = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, _a, isActive, subscription, expirationDate, remainingTime;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _b.sent();
                            return [4 /*yield*/, this.subscriptionService.checkSubscriptionStatus(user.id)];
                        case 2:
                            _a = _b.sent(), isActive = _a.isActive, subscription = _a.subscription;
                            if (!isActive) return [3 /*break*/, 4];
                            expirationDate = new Date(subscription.createdAt);
                            expirationDate.setMonth(expirationDate.getMonth() + 1);
                            remainingTime = this.utilsService.calculateRemainingSubscriptionTime(expirationDate, new Date());
                            return [4 /*yield*/, this.sendPlanMenuMessage(ctx, subscription.plan, remainingTime)];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.sendPlanMenuMessage(ctx, 'No subscription', 'N/A')];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        PlanWizard_1.prototype.confirmSubscription = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var plan, amountUSDC;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            plan = ctx.scene.state.plan;
                            amountUSDC = enums_1.SubscriptionPlanAmount[plan];
                            return [4 /*yield*/, this.sendInvoiceConfirmationMessage(ctx, plan, amountUSDC)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        PlanWizard_1.prototype.handleConfirmPayment = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.textService.autoDeleteMessage(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.confirmSubscriptionTransaction(ctx)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }, this.i18n.translate('i18n.menus.solana.initializing_transaction'))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        PlanWizard_1.prototype.handleCancelPayment = function (ctx) {
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
        PlanWizard_1.prototype.handleBronzePlan = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx.scene.state.plan = 'Bronze';
                            return [4 /*yield*/, this.textService.autoDeleteMessage(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.confirmSubscription(ctx)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }, this.i18n.translate('i18n.menus.solana.initializing_transaction'))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        PlanWizard_1.prototype.handleSilverPlan = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx.scene.state.plan = 'Silver';
                            return [4 /*yield*/, this.textService.autoDeleteMessage(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.confirmSubscription(ctx)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }, this.i18n.translate('i18n.menus.solana.initializing_transaction'))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        PlanWizard_1.prototype.handleGoldPlan = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ctx.scene.state.plan = 'Gold';
                            return [4 /*yield*/, this.textService.autoDeleteMessage(ctx, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.confirmSubscription(ctx)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }, this.i18n.translate('i18n.menus.solana.initializing_transaction'))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        PlanWizard_1.prototype.close = function (ctx) {
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
        PlanWizard_1.prototype.cancel = function (ctx) {
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
        return PlanWizard_1;
    }());
    __setFunctionName(_classThis, "PlanWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handlePlanScene_decorators = [(0, nestjs_telegraf_1.WizardStep)(1)];
        _confirmSubscription_decorators = [(0, nestjs_telegraf_1.WizardStep)(2)];
        _handleConfirmPayment_decorators = [(0, nestjs_telegraf_1.Action)('confirm_subscription')];
        _handleCancelPayment_decorators = [(0, nestjs_telegraf_1.Action)('cancel_payment')];
        _handleBronzePlan_decorators = [(0, nestjs_telegraf_1.Action)('bronzePlan')];
        _handleSilverPlan_decorators = [(0, nestjs_telegraf_1.Action)('silverPlan')];
        _handleGoldPlan_decorators = [(0, nestjs_telegraf_1.Action)('goldPlan')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        _cancel_decorators = [(0, nestjs_telegraf_1.Action)('cancel')];
        __esDecorate(_classThis, null, _handlePlanScene_decorators, { kind: "method", name: "handlePlanScene", static: false, private: false, access: { has: function (obj) { return "handlePlanScene" in obj; }, get: function (obj) { return obj.handlePlanScene; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmSubscription_decorators, { kind: "method", name: "confirmSubscription", static: false, private: false, access: { has: function (obj) { return "confirmSubscription" in obj; }, get: function (obj) { return obj.confirmSubscription; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleConfirmPayment_decorators, { kind: "method", name: "handleConfirmPayment", static: false, private: false, access: { has: function (obj) { return "handleConfirmPayment" in obj; }, get: function (obj) { return obj.handleConfirmPayment; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleCancelPayment_decorators, { kind: "method", name: "handleCancelPayment", static: false, private: false, access: { has: function (obj) { return "handleCancelPayment" in obj; }, get: function (obj) { return obj.handleCancelPayment; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleBronzePlan_decorators, { kind: "method", name: "handleBronzePlan", static: false, private: false, access: { has: function (obj) { return "handleBronzePlan" in obj; }, get: function (obj) { return obj.handleBronzePlan; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleSilverPlan_decorators, { kind: "method", name: "handleSilverPlan", static: false, private: false, access: { has: function (obj) { return "handleSilverPlan" in obj; }, get: function (obj) { return obj.handleSilverPlan; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleGoldPlan_decorators, { kind: "method", name: "handleGoldPlan", static: false, private: false, access: { has: function (obj) { return "handleGoldPlan" in obj; }, get: function (obj) { return obj.handleGoldPlan; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlanWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlanWizard = _classThis;
}();
exports.PlanWizard = PlanWizard;
