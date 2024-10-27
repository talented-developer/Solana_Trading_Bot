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
exports.ReferralWizard = void 0;
var common_1 = require("@nestjs/common");
var nestjs_telegraf_1 = require("nestjs-telegraf");
var web3_js_1 = require("@solana/web3.js");
var ReferralWizard = function () {
    var _classDecorators = [(0, nestjs_telegraf_1.Wizard)('referral')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleReferral_decorators;
    var _claimRewardsSol_decorators;
    var _claimRewardsUSDC_decorators;
    var _close_decorators;
    var ReferralWizard = _classThis = /** @class */ (function () {
        function ReferralWizard_1(prisma, i18n, utilsService, markupButtonsService, referralService, textService, userService, claimService, solanaService) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.i18n = i18n;
            this.utilsService = utilsService;
            this.markupButtonsService = markupButtonsService;
            this.referralService = referralService;
            this.textService = textService;
            this.userService = userService;
            this.claimService = claimService;
            this.solanaService = solanaService;
            this.logger = new common_1.Logger(this.constructor.name);
        }
        ReferralWizard_1.prototype.referralDetails = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, refLink, _a, referralCount, totalSol, totalUSDCinLamports, totalUSDC, fullRefLink;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { telegramId: telegramId } })];
                        case 1:
                            user = _b.sent();
                            _a = user.refLink;
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.referralService.generateRefereeRefLink(user.id)];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            refLink = _a;
                            return [4 /*yield*/, this.referralService.getReferredCount(user.id)];
                        case 4:
                            referralCount = _b.sent();
                            return [4 /*yield*/, this.referralService.calculateReferralRewards(user.id, 'sol')];
                        case 5:
                            totalSol = _b.sent();
                            return [4 /*yield*/, this.referralService.calculateReferralRewards(user.id, 'usdc')];
                        case 6:
                            totalUSDCinLamports = _b.sent();
                            totalUSDC = totalUSDCinLamports / web3_js_1.LAMPORTS_PER_SOL;
                            this.logger.debug("Total SOL reward for userId ".concat(user.id, ": ").concat(totalSol));
                            this.logger.debug("Total USDC reward for userId ".concat(user.id, ": ").concat(totalUSDCinLamports, " lamports, which is ").concat(totalUSDC, " USDC"));
                            fullRefLink = "https://t.me/algora_test_bot?start=r-".concat(refLink);
                            return [2 /*return*/, {
                                    referralId: user.id.toString(),
                                    referralLink: fullRefLink,
                                    createdOn: user.createdAt.toDateString(),
                                    referredUsers: referralCount.toString(),
                                    claimRewardsSol: (totalSol / web3_js_1.LAMPORTS_PER_SOL).toFixed(6),
                                    claimRewardsUSDC: totalUSDC.toFixed(2),
                                }];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.handleReferral = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, referralId, referralLink, createdOn, referredUsers, claimRewardsSol, claimRewardsUSDC, template, formattedReferralText, buttons;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.referralDetails(ctx)];
                        case 1:
                            _a = _b.sent(), referralId = _a.referralId, referralLink = _a.referralLink, createdOn = _a.createdOn, referredUsers = _a.referredUsers, claimRewardsSol = _a.claimRewardsSol, claimRewardsUSDC = _a.claimRewardsUSDC;
                            template = this.i18n.translate('i18n.menus.referral.referral_menu', {
                                args: {
                                    referral_id: referralId,
                                    referral_link: referralLink,
                                    created_on: createdOn,
                                    referred_users: referredUsers,
                                    claim_rewards_sol: claimRewardsSol,
                                    claim_rewards_usdc: claimRewardsUSDC,
                                },
                            });
                            formattedReferralText = this.utilsService.formatText(template, {
                                referralId: referralId,
                                referralLink: referralLink,
                                createdOn: createdOn,
                                referredUsers: referredUsers,
                                claimRewardsSol: claimRewardsSol,
                                claimRewardsUSDC: claimRewardsUSDC,
                            });
                            return [4 /*yield*/, this.markupButtonsService.referralMenuButtons()];
                        case 2:
                            buttons = _b.sent();
                            return [4 /*yield*/, ctx.reply(formattedReferralText, {
                                    parse_mode: 'HTML',
                                    reply_markup: { inline_keyboard: buttons },
                                })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.claimRewardsSol = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processClaim(ctx, 'sol')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.claimRewardsUSDC = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processClaim(ctx, 'usdc')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.processClaim = function (ctx, rewardType) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, totalRewards, minClaim, transactionHash, userWallet, _a, successMessage, errorMessage;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _b.sent();
                            return [4 /*yield*/, this.referralService.calculateReferralRewards(user.id, rewardType)];
                        case 2:
                            totalRewards = _b.sent();
                            minClaim = rewardType === 'sol' ? 0.1 : 30;
                            transactionHash = '';
                            if (!(totalRewards >= minClaim)) return [3 /*break*/, 12];
                            userWallet = user.walletAddress;
                            _a = rewardType;
                            switch (_a) {
                                case 'sol': return [3 /*break*/, 3];
                                case 'usdc': return [3 /*break*/, 6];
                            }
                            return [3 /*break*/, 9];
                        case 3: return [4 /*yield*/, this.solanaService.sendSol(userWallet, Math.floor(totalRewards))];
                        case 4:
                            transactionHash = _b.sent();
                            return [4 /*yield*/, this.recordClaim(user.id, totalRewards, 0, transactionHash)];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 10];
                        case 6: return [4 /*yield*/, this.solanaService.sendUSDC(userWallet, totalRewards)];
                        case 7:
                            transactionHash = _b.sent();
                            return [4 /*yield*/, this.recordClaim(user.id, 0, totalRewards, transactionHash)];
                        case 8:
                            _b.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            this.logger.error("Unsupported reward type: ".concat(rewardType));
                            return [2 /*return*/];
                        case 10:
                            successMessage = this.i18n.translate('i18n.menus.solana.transaction_claim_success', {
                                args: {
                                    amount: rewardType === 'sol'
                                        ? (totalRewards / web3_js_1.LAMPORTS_PER_SOL).toFixed(6)
                                        : (totalRewards / web3_js_1.LAMPORTS_PER_SOL).toFixed(2),
                                    rewardType: rewardType.toUpperCase(),
                                    transactionHash: transactionHash,
                                    from: user.walletAddress,
                                    to: user.walletAddress,
                                    solanaScanUrl: "https://solscan.io/tx/".concat(transactionHash),
                                },
                            });
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, successMessage)];
                        case 11:
                            _b.sent();
                            return [3 /*break*/, 14];
                        case 12:
                            errorMessage = this.i18n.translate('i18n.error_messages.no_rewards_error');
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, errorMessage)];
                        case 13:
                            _b.sent();
                            _b.label = 14;
                        case 14:
                            ctx.scene.leave();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.recordClaim = function (userId, amountSol, amountUSDC, transactionHash) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.claimService.createClaim(userId, amountSol, amountUSDC, transactionHash)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReferralWizard_1.prototype.close = function (ctx) {
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
        return ReferralWizard_1;
    }());
    __setFunctionName(_classThis, "ReferralWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleReferral_decorators = [(0, nestjs_telegraf_1.WizardStep)(1)];
        _claimRewardsSol_decorators = [(0, nestjs_telegraf_1.Action)('claim_rewards_sol')];
        _claimRewardsUSDC_decorators = [(0, nestjs_telegraf_1.Action)('claim_rewards_usdc')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        __esDecorate(_classThis, null, _handleReferral_decorators, { kind: "method", name: "handleReferral", static: false, private: false, access: { has: function (obj) { return "handleReferral" in obj; }, get: function (obj) { return obj.handleReferral; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _claimRewardsSol_decorators, { kind: "method", name: "claimRewardsSol", static: false, private: false, access: { has: function (obj) { return "claimRewardsSol" in obj; }, get: function (obj) { return obj.claimRewardsSol; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _claimRewardsUSDC_decorators, { kind: "method", name: "claimRewardsUSDC", static: false, private: false, access: { has: function (obj) { return "claimRewardsUSDC" in obj; }, get: function (obj) { return obj.claimRewardsUSDC; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReferralWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReferralWizard = _classThis;
}();
exports.ReferralWizard = ReferralWizard;
