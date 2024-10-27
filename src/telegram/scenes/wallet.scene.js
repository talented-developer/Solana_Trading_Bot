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
exports.WalletWizard = void 0;
var common_1 = require("@nestjs/common");
var nestjs_telegraf_1 = require("nestjs-telegraf");
var solana_utils_1 = require("../../solana/solana-utils");
var qrcode = require("qrcode");
var constants_1 = require("../../../shared/constants");
var web3_js_1 = require("@solana/web3.js");
var WalletWizard = function () {
    var _classDecorators = [(0, common_1.Injectable)(), (0, nestjs_telegraf_1.Wizard)('wallet')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleWalletCommand_decorators;
    var _addWithdrawWallet_decorators;
    var _confirmWithdraw_decorators;
    var _handleWithdrawAction_decorators;
    var _confirmWithdrawTransaction_decorators;
    var _cancelWithdraw_decorators;
    var _generateQRCode_decorators;
    var _backToWalletMenu_decorators;
    var _refreshWalletMessage_decorators;
    var _close_decorators;
    var WalletWizard = _classThis = /** @class */ (function () {
        function WalletWizard_1(userService, settingsService, i18n, utilsService, markupButtonsService, solanaService, textService) {
            this.userService = (__runInitializers(this, _instanceExtraInitializers), userService);
            this.settingsService = settingsService;
            this.i18n = i18n;
            this.utilsService = utilsService;
            this.markupButtonsService = markupButtonsService;
            this.solanaService = solanaService;
            this.textService = textService;
            this.logger = new common_1.Logger(WalletWizard.name);
        }
        WalletWizard_1.prototype.generateWalletMessage = function (user, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var walletTemplate, balanceInLamports, balanceInSol, walletDetails;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            walletTemplate = this.i18n.translate('i18n.menus.wallet');
                            return [4 /*yield*/, this.solanaService.getBalance(user.walletAddress)];
                        case 1:
                            balanceInLamports = _a.sent();
                            balanceInSol = solana_utils_1.SolanaUtils.lamportsToSol(balanceInLamports);
                            walletDetails = {
                                walletAddress: user.walletAddress || 'N/A',
                                balance: balanceInSol.toFixed(3),
                                withdrawWallet: settings.withdrawWallet || 'N/A',
                            };
                            return [2 /*return*/, this.utilsService.formatText(walletTemplate, walletDetails)];
                    }
                });
            });
        };
        WalletWizard_1.prototype.validateAndUpdateSetting = function (ctx, inputValue, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var settingKey, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingKey = ctx.scene.state.settingKey;
                            result = this.utilsService.validateOnSettingsKey(settingKey, inputValue, settings);
                            if (!result.errorMessage) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, this.i18n.translate(result.errorMessage))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { value: null, errorMessage: result.errorMessage }];
                        case 2:
                            if (!(settingKey === 'withdrawWallet')) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.settingsService.updateWithdrawWallet(ctx.from.id, result.value)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            ctx.scene.state.amountToSend = result.value;
                            _a.label = 5;
                        case 5: return [2 /*return*/, { value: result.value, errorMessage: null }];
                    }
                });
            });
        };
        WalletWizard_1.prototype.saveState = function (ctx, settingKey, replyMessage) {
            ctx.scene.state.settingKey = settingKey;
            ctx.scene.state.messageIdEnterAmount = ctx.callbackQuery.message.message_id;
            ctx.scene.state.replyMessageId = replyMessage.message_id;
        };
        WalletWizard_1.prototype.processTransaction = function (user, withdrawWallet, lamportsToSend) {
            return __awaiter(this, void 0, void 0, function () {
                var fromSecretKey, sendSolPromise, timeoutPromise;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.getUserSecretKey(user.id)];
                        case 1:
                            fromSecretKey = _a.sent();
                            sendSolPromise = this.solanaService.sendSolWithKey(fromSecretKey, withdrawWallet, lamportsToSend);
                            timeoutPromise = new Promise(function (_, reject) {
                                var errorMessage = _this.i18n.translate('i18n.error_messages.solana_doesnt_response_error');
                                setTimeout(function () { return reject(new Error(errorMessage)); }, 10000);
                            });
                            return [2 /*return*/, Promise.race([sendSolPromise, timeoutPromise])];
                    }
                });
            });
        };
        WalletWizard_1.prototype.handleWithdrawTransaction = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, solToSend, lamportsToSend, user, settings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            solToSend = parseFloat(ctx.scene.state.amountToSend);
                            lamportsToSend = solana_utils_1.SolanaUtils.solToLamports(solToSend);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.attemptTransaction(ctx, user, settings.withdrawWallet, lamportsToSend, solToSend.toString())];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, ctx.scene.leave()];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.attemptTransaction = function (ctx, user, withdrawWallet, lamportsToSend, amountSOL) {
            return __awaiter(this, void 0, void 0, function () {
                var transactionHash, transactionDetails, _a, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 5]);
                            return [4 /*yield*/, this.processTransaction(user, withdrawWallet, lamportsToSend)];
                        case 1:
                            transactionHash = _b.sent();
                            transactionDetails = solana_utils_1.SolanaUtils.createTransactionDetails(transactionHash, user.walletAddress, withdrawWallet, constants_1.default.solana.transaction_type.withdraw_sol, parseFloat(amountSOL), lamportsToSend / web3_js_1.LAMPORTS_PER_SOL);
                            return [4 /*yield*/, this.sendSuccessMessage(ctx, transactionDetails)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 3:
                            _a = _b.sent();
                            message = this.i18n.translate('i18n.error_messages.solana_doesnt_response_error');
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, message)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, false];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.sendSuccessMessage = function (ctx, transactionDetails) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.menus.solana.transaction_success', { args: { solana: transactionDetails } });
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, message)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.handleWalletCommand = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, settings, message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.generateWalletMessage(user, settings)];
                        case 3:
                            message = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.walletMenuButtons()];
                        case 4:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 5:
                            _a.sent();
                            ctx.wizard.next();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.addWithdrawWallet = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, walletAddressFromInput, validationResult, amountToSendMessage, replyMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _a.sent();
                            walletAddressFromInput = this.utilsService.getTextFromInput(ctx);
                            return [4 /*yield*/, this.validateAndUpdateSetting(ctx, walletAddressFromInput, settings)];
                        case 2:
                            validationResult = _a.sent();
                            if (validationResult.errorMessage) {
                                return [2 /*return*/];
                            }
                            amountToSendMessage = this.i18n.translate('i18n.menus.wallet.replies.withdraw_amount');
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, amountToSendMessage)];
                        case 3:
                            replyMessage = _a.sent();
                            this.saveState(ctx, 'amountToSend', replyMessage);
                            ctx.wizard.next();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.confirmWithdraw = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, withdrawWallet, amountToSend, validationResult, confirmMessage, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _a.sent();
                            withdrawWallet = settings.withdrawWallet;
                            amountToSend = this.utilsService.getTextFromInput(ctx);
                            validationResult = this.utilsService.validatePositiveNumber(amountToSend);
                            if (!validationResult.errorMessage) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, this.i18n.translate(validationResult.errorMessage))];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                        case 3:
                            ctx.scene.state.amountToSend = validationResult.value;
                            confirmMessage = this.i18n.translate('i18n.menus.wallet.confirmation.withdraw_wallet_confirmation', {
                                args: {
                                    withdrawWallet: withdrawWallet,
                                    amountToSend: amountToSend,
                                },
                            });
                            return [4 /*yield*/, this.markupButtonsService.withdrawWalletConfirmationButtons()];
                        case 4:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, confirmMessage, buttons)];
                        case 5:
                            _a.sent();
                            ctx.wizard.next();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.handleWithdrawAction = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, withdrawWallet, addWalletMessage, amountToSendMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _a.sent();
                            withdrawWallet = settings.withdrawWallet;
                            if (!!withdrawWallet) return [3 /*break*/, 3];
                            addWalletMessage = this.i18n.translate('i18n.menus.wallet.replies.add_withdraw_wallet');
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, addWalletMessage)];
                        case 2:
                            _a.sent();
                            ctx.wizard.next();
                            return [3 /*break*/, 5];
                        case 3:
                            amountToSendMessage = this.i18n.translate('i18n.menus.wallet.replies.withdraw_amount');
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, amountToSendMessage)];
                        case 4:
                            _a.sent();
                            ctx.wizard.selectStep(1);
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.confirmWithdrawTransaction = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.handleWithdrawTransaction(ctx)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.cancelWithdraw = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ctx.reply(this.i18n.translate('i18n.menus.wallet.replies.withdraw_canceled'))];
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
        WalletWizard_1.prototype.generateQRCode = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, qrCodeBuffer, photoInputFile, caption, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userService.getUserByTelegramId(ctx.from.id)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, qrcode.toBuffer(user.walletAddress, { type: 'png' })];
                        case 2:
                            qrCodeBuffer = _a.sent();
                            photoInputFile = { source: qrCodeBuffer };
                            caption = this.i18n.translate('i18n.menus.wallet.wallet_address', { args: { wallet: user.walletAddress } });
                            return [4 /*yield*/, this.markupButtonsService.depositMenuButton()];
                        case 3:
                            buttons = _a.sent();
                            if (!(ctx.callbackQuery && ctx.callbackQuery.message)) return [3 /*break*/, 5];
                            return [4 /*yield*/, ctx.deleteMessage(ctx.callbackQuery.message.message_id)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [4 /*yield*/, ctx.replyWithPhoto(photoInputFile, {
                                caption: caption,
                                parse_mode: 'HTML',
                                reply_markup: { inline_keyboard: buttons },
                            })];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.backToWalletMenu = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, settings, message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.generateWalletMessage(user, settings)];
                        case 3:
                            message = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.walletMenuButtons()];
                        case 4:
                            buttons = _a.sent();
                            if (!(ctx.callbackQuery && ctx.callbackQuery.message)) return [3 /*break*/, 6];
                            return [4 /*yield*/, ctx.deleteMessage(ctx.callbackQuery.message.message_id)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.refreshWalletMessage = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, settings, updatedMessageText, buttons, currentMessage, currentText, newText;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.generateWalletMessage(user, settings)];
                        case 3:
                            updatedMessageText = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.walletMenuButtons()];
                        case 4:
                            buttons = _a.sent();
                            currentMessage = ctx.callbackQuery.message;
                            currentText = currentMessage.text.replace(/\s/g, '');
                            newText = updatedMessageText.replace(/\s/g, '');
                            if (!this.utilsService.hasContentChanged(currentText, currentMessage.reply_markup.inline_keyboard, newText, buttons)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, updatedMessageText, buttons, ctx.chat.id, currentMessage.message_id)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            this.logger.debug('No changes detected, skipping update.');
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        WalletWizard_1.prototype.close = function (ctx) {
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
        return WalletWizard_1;
    }());
    __setFunctionName(_classThis, "WalletWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleWalletCommand_decorators = [(0, nestjs_telegraf_1.WizardStep)(0)];
        _addWithdrawWallet_decorators = [(0, nestjs_telegraf_1.WizardStep)(1)];
        _confirmWithdraw_decorators = [(0, nestjs_telegraf_1.WizardStep)(2)];
        _handleWithdrawAction_decorators = [(0, nestjs_telegraf_1.Action)('withdraw')];
        _confirmWithdrawTransaction_decorators = [(0, nestjs_telegraf_1.Action)('confirm_withdraw')];
        _cancelWithdraw_decorators = [(0, nestjs_telegraf_1.Action)('cancel_withdraw')];
        _generateQRCode_decorators = [(0, nestjs_telegraf_1.Action)('deposit')];
        _backToWalletMenu_decorators = [(0, nestjs_telegraf_1.Action)('back_to_wallet')];
        _refreshWalletMessage_decorators = [(0, nestjs_telegraf_1.Action)('refresh')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        __esDecorate(_classThis, null, _handleWalletCommand_decorators, { kind: "method", name: "handleWalletCommand", static: false, private: false, access: { has: function (obj) { return "handleWalletCommand" in obj; }, get: function (obj) { return obj.handleWalletCommand; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addWithdrawWallet_decorators, { kind: "method", name: "addWithdrawWallet", static: false, private: false, access: { has: function (obj) { return "addWithdrawWallet" in obj; }, get: function (obj) { return obj.addWithdrawWallet; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmWithdraw_decorators, { kind: "method", name: "confirmWithdraw", static: false, private: false, access: { has: function (obj) { return "confirmWithdraw" in obj; }, get: function (obj) { return obj.confirmWithdraw; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWithdrawAction_decorators, { kind: "method", name: "handleWithdrawAction", static: false, private: false, access: { has: function (obj) { return "handleWithdrawAction" in obj; }, get: function (obj) { return obj.handleWithdrawAction; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmWithdrawTransaction_decorators, { kind: "method", name: "confirmWithdrawTransaction", static: false, private: false, access: { has: function (obj) { return "confirmWithdrawTransaction" in obj; }, get: function (obj) { return obj.confirmWithdrawTransaction; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelWithdraw_decorators, { kind: "method", name: "cancelWithdraw", static: false, private: false, access: { has: function (obj) { return "cancelWithdraw" in obj; }, get: function (obj) { return obj.cancelWithdraw; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateQRCode_decorators, { kind: "method", name: "generateQRCode", static: false, private: false, access: { has: function (obj) { return "generateQRCode" in obj; }, get: function (obj) { return obj.generateQRCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _backToWalletMenu_decorators, { kind: "method", name: "backToWalletMenu", static: false, private: false, access: { has: function (obj) { return "backToWalletMenu" in obj; }, get: function (obj) { return obj.backToWalletMenu; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _refreshWalletMessage_decorators, { kind: "method", name: "refreshWalletMessage", static: false, private: false, access: { has: function (obj) { return "refreshWalletMessage" in obj; }, get: function (obj) { return obj.refreshWalletMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WalletWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WalletWizard = _classThis;
}();
exports.WalletWizard = WalletWizard;
