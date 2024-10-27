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
exports.SettingsWizard = void 0;
var nestjs_telegraf_1 = require("nestjs-telegraf");
var common_1 = require("@nestjs/common");
var SettingsWizard = function () {
    var _classDecorators = [(0, nestjs_telegraf_1.Wizard)('settings')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _step0_decorators;
    var _enterInputTradeSettings_decorators;
    var _enterInputCallsSettings_decorators;
    var _tradeSettings_decorators;
    var _callsSettings_decorators;
    var _backToMainMenu_decorators;
    var _askForMinBuyAmount_decorators;
    var _askForMaxBuyAmount_decorators;
    var _askForSlippage_decorators;
    var _askForPriorityFee_decorators;
    var _askForWithdrawWallet_decorators;
    var _askForMinMarketCap_decorators;
    var _askForMaxMarketCap_decorators;
    var _setTopHoldersHandler_decorators;
    var _setDevWalletHandler_decorators;
    var _setSpikeVolumeHandler_decorators;
    var _setWhaleDetectionHandler_decorators;
    var _askForNumberOfHoldersMin_decorators;
    var _toggleFreezeStatus_decorators;
    var _toggleMEVProtection_decorators;
    var _close_decorators;
    var SettingsWizard = _classThis = /** @class */ (function () {
        function SettingsWizard_1(i18n, userService, utilsService, solanaService, settingsService, markupButtonsService, textService) {
            this.i18n = (__runInitializers(this, _instanceExtraInitializers), i18n);
            this.userService = userService;
            this.utilsService = utilsService;
            this.solanaService = solanaService;
            this.settingsService = settingsService;
            this.markupButtonsService = markupButtonsService;
            this.textService = textService;
            this.logger = new common_1.Logger(this.constructor.name);
        }
        SettingsWizard_1.prototype.step0 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, settings, mainMenuMessage, buttons, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.generateMainMenuMessage(user, settings)];
                        case 3:
                            mainMenuMessage = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.settingsMainMenuButtons()];
                        case 4:
                            buttons = _a.sent();
                            if (!ctx.scene.state.replyMessageId) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, mainMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, mainMenuMessage, buttons)];
                        case 7:
                            message = _a.sent();
                            this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
                            _a.label = 8;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.enterInputTradeSettings = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var inputValue, telegramId, settings, validationResult;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            inputValue = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.trim();
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _c.sent();
                            validationResult = this.validateAndUpdateSetting(ctx, inputValue, settings);
                            if (!validationResult.errorMessage) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, validationResult.errorMessage)];
                        case 2:
                            _c.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.updateTradeSettingsAndRespond(ctx, telegramId, validationResult.value)];
                        case 4:
                            _c.sent();
                            ctx.wizard.selectStep(1);
                            return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.enterInputCallsSettings = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var inputValue, telegramId, settings, validationResult;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            inputValue = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.trim();
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _c.sent();
                            validationResult = this.validateAndUpdateSetting(ctx, inputValue, settings);
                            if (!validationResult.errorMessage) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.textService.sendMessageNoButtons(ctx, validationResult.errorMessage)];
                        case 2:
                            _c.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.updateCallsSettingsAndRespond(ctx, telegramId, validationResult.value)];
                        case 4:
                            _c.sent();
                            ctx.wizard.selectStep(2);
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.tradeSettings = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.updateSettings(ctx, 'trade')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.callsSettings = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.updateSettings(ctx, 'calls')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.updateSettings = function (ctx, type) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, user, settingsMenuMessage, _a, buttons, _b, message;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 1:
                            settings = _c.sent();
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 2:
                            user = _c.sent();
                            if (!(type === 'trade')) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getTradeSettingsMessage(user, settings)];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.getCallsSettingsMessage(settings)];
                        case 5:
                            _a = _c.sent();
                            _c.label = 6;
                        case 6:
                            settingsMenuMessage = _a;
                            if (!(type === 'trade')) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.markupButtonsService.tradeSettingsMenuButtons(settings)];
                        case 7:
                            _b = _c.sent();
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, this.markupButtonsService.callsSettingsMenuButtons(settings)];
                        case 9:
                            _b = _c.sent();
                            _c.label = 10;
                        case 10:
                            buttons = _b;
                            if (!(ctx.callbackQuery && ctx.callbackQuery.message)) return [3 /*break*/, 12];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, settingsMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 11:
                            _c.sent();
                            return [3 /*break*/, 16];
                        case 12:
                            if (!ctx.scene.state.replyMessageId) return [3 /*break*/, 14];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, settingsMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId)];
                        case 13:
                            _c.sent();
                            return [3 /*break*/, 16];
                        case 14: return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, settingsMenuMessage, buttons)];
                        case 15:
                            message = _c.sent();
                            this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
                            _c.label = 16;
                        case 16: return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.backToMainMenu = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user, settings, mainMenuMessage, buttons, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.generateMainMenuMessage(user, settings)];
                        case 3:
                            mainMenuMessage = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.settingsMainMenuButtons()];
                        case 4:
                            buttons = _a.sent();
                            if (!(ctx.callbackQuery && ctx.callbackQuery.message)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, mainMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 6:
                            if (!ctx.scene.state.replyMessageId) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, mainMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId)];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, mainMenuMessage, buttons)];
                        case 9:
                            message = _a.sent();
                            this.utilsService.saveState(ctx, { replyMessageId: message.message_id });
                            _a.label = 10;
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForMinBuyAmount = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.minBuy');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'minBuy', promptMessage, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForMaxBuyAmount = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.maxBuy');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'maxBuy', promptMessage, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForSlippage = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.slippage');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'slippage', promptMessage, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForPriorityFee = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.priorityFee');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'priorityFee', promptMessage, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForWithdrawWallet = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.withdrawWallet');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'withdrawWallet', promptMessage, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForMinMarketCap = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.minMarketCap');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'minMarketCap', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForMaxMarketCap = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.maxMarketCap');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'maxMarketCap', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.setTopHoldersHandler = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.topHoldersRatio');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'topHoldersRatio', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.setDevWalletHandler = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.devWalletPercentage');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'devWalletPercentage', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.setSpikeVolumeHandler = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.spikeVolumeThreshold');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'spikeVolumeThreshold', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.setWhaleDetectionHandler = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.whaleThreshold');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'whaleThreshold', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.askForNumberOfHoldersMin = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var promptMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promptMessage = this.i18n.translate('i18n.input_messages.numberOfHoldersMin');
                            return [4 /*yield*/, this.askForValueForSettings(ctx, 'numberOfHoldersMin', promptMessage, 2)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.toggleFreezeStatus = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, callsSettingsMenuMessage, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.settingsService.toggleFreezeStatus(BigInt(telegramId))];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(BigInt(telegramId))];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.getCallsSettingsMessage(settings)];
                        case 3:
                            callsSettingsMenuMessage = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.callsSettingsMenuButtons(settings)];
                        case 4:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.updateMessage(ctx, callsSettingsMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.toggleMEVProtection = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, settings, user, tradeSettingsMenuMessage, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = ctx.from.id;
                            return [4 /*yield*/, this.settingsService.toggleMevProtection(BigInt(telegramId))];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(BigInt(telegramId))];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 3:
                            user = _a.sent();
                            return [4 /*yield*/, this.getTradeSettingsMessage(user, settings)];
                        case 4:
                            tradeSettingsMenuMessage = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.tradeSettingsMenuButtons(settings)];
                        case 5:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.updateMessage(ctx, tradeSettingsMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        SettingsWizard_1.prototype.close = function (ctx) {
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
        SettingsWizard_1.prototype.getCallsSettingsObject = function (settings) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    return [2 /*return*/, {
                            minMarketCap: (_a = settings === null || settings === void 0 ? void 0 : settings.minMarketCap) !== null && _a !== void 0 ? _a : 'N/A',
                            maxMarketCap: (_b = settings === null || settings === void 0 ? void 0 : settings.maxMarketCap) !== null && _b !== void 0 ? _b : 'N/A',
                            topHoldersRatio: (_c = settings === null || settings === void 0 ? void 0 : settings.topHoldersRatio) !== null && _c !== void 0 ? _c : 'N/A',
                            devWalletPercentage: (_d = settings === null || settings === void 0 ? void 0 : settings.devWalletPercentage) !== null && _d !== void 0 ? _d : 'N/A',
                            spikeVolumeThreshold: (_e = settings === null || settings === void 0 ? void 0 : settings.spikeVolumeThreshold) !== null && _e !== void 0 ? _e : 'N/A',
                            whaleThreshold: (_f = settings === null || settings === void 0 ? void 0 : settings.whaleThreshold) !== null && _f !== void 0 ? _f : 'N/A',
                            freezeStatus: (settings === null || settings === void 0 ? void 0 : settings.freezeStatus) ? '🟢' : '🔴',
                            numberOfHoldersMin: (_g = settings === null || settings === void 0 ? void 0 : settings.numberOfHoldersMin) !== null && _g !== void 0 ? _g : 'N/A',
                        }];
                });
            });
        };
        SettingsWizard_1.prototype.getTradeSettingsObject = function (user, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var balance;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.solanaService.getBalance(user.walletAddress)];
                        case 1:
                            balance = _e.sent();
                            return [2 /*return*/, {
                                    mevProtection: (settings === null || settings === void 0 ? void 0 : settings.mevProtection) ? 'Secured' : 'Speed Optimized',
                                    slippage: (_a = settings === null || settings === void 0 ? void 0 : settings.slippage) !== null && _a !== void 0 ? _a : 'N/A',
                                    minBuy: (_b = settings === null || settings === void 0 ? void 0 : settings.minBuy) !== null && _b !== void 0 ? _b : 'N/A',
                                    maxBuy: (_c = settings === null || settings === void 0 ? void 0 : settings.maxBuy) !== null && _c !== void 0 ? _c : 'N/A',
                                    priorityFee: (_d = settings === null || settings === void 0 ? void 0 : settings.priorityFee) !== null && _d !== void 0 ? _d : 'N/A',
                                    withdrawWallet: (settings === null || settings === void 0 ? void 0 : settings.withdrawWallet) || 'N/A',
                                    walletAddress: user.walletAddress || 'N/A',
                                    balance: balance || 'N/A',
                                }];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.generateMainMenuMessage = function (user, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var tradeSettingsMenuMessage, callsSettingsMenuMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getTradeSettingsMessage(user, settings)];
                        case 1:
                            tradeSettingsMenuMessage = _a.sent();
                            return [4 /*yield*/, this.getCallsSettingsMessage(settings)];
                        case 2:
                            callsSettingsMenuMessage = _a.sent();
                            return [2 /*return*/, "".concat(tradeSettingsMenuMessage, "\n\n").concat(callsSettingsMenuMessage)];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.getTradeSettingsMessage = function (user, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var tradeSettingsMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getTradeSettingsObject(user, settings)];
                        case 1:
                            tradeSettingsMessage = _a.sent();
                            return [2 /*return*/, this.i18n.translate('i18n.menus.settings.trade_menu', { args: tradeSettingsMessage })];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.getCallsSettingsMessage = function (settings) {
            return __awaiter(this, void 0, void 0, function () {
                var callsSettingsMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCallsSettingsObject(settings)];
                        case 1:
                            callsSettingsMessage = _a.sent();
                            return [2 /*return*/, this.i18n.translate('i18n.menus.settings.calls_menu', { args: callsSettingsMessage })];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.askForValueForSettings = function (ctx, settingKey, promptMessage, step) {
            return __awaiter(this, void 0, void 0, function () {
                var message, replyMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = this.i18n.translate('i18n.input_messages.prompt', { args: { promptMessage: promptMessage } });
                            return [4 /*yield*/, this.textService.sendForceReplyInputMessage(ctx, message)];
                        case 1:
                            replyMessage = _a.sent();
                            this.utilsService.saveState(ctx, { settingKey: settingKey }, replyMessage);
                            ctx.wizard.selectStep(step);
                            return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.validateAndUpdateSetting = function (ctx, inputValue, settings) {
            var settingKey = ctx.scene.state.settingKey;
            var _a = this.utilsService.validateOnSettingsKey(settingKey, inputValue, settings), value = _a.value, errorMessage = _a.errorMessage;
            if (errorMessage) {
                this.textService.sendMessageNoButtons(ctx, this.i18n.translate(errorMessage));
            }
            return {
                value: errorMessage ? null : value,
                errorMessage: errorMessage ? this.i18n.translate(errorMessage) : null,
            };
        };
        SettingsWizard_1.prototype.updateTradeSettingsAndRespond = function (ctx, telegramId, newValue) {
            return __awaiter(this, void 0, void 0, function () {
                var settingKey, settings, user, tradeSettingsMenuMessage, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingKey = ctx.scene.state.settingKey;
                            return [4 /*yield*/, this.updateTradeSettings(settingKey, telegramId, newValue)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 3:
                            user = _a.sent();
                            return [4 /*yield*/, this.getTradeSettingsMessage(user, settings)];
                        case 4:
                            tradeSettingsMenuMessage = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.tradeSettingsMenuButtons(settings)];
                        case 5:
                            buttons = _a.sent();
                            if (!ctx.scene.state.replyMessageId) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, tradeSettingsMenuMessage, buttons, ctx.chat.id, ctx.scene.state.replyMessageId)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.updateCallsSettingsAndRespond = function (ctx, telegramId, newValue) {
            return __awaiter(this, void 0, void 0, function () {
                var settingKey, settings, callsSettingsTemplate, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingKey = ctx.scene.state.settingKey;
                            return [4 /*yield*/, this.updateCallsSettings(settingKey, telegramId, newValue)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.settingsService.getSettingsByTelegramId(telegramId)];
                        case 2:
                            settings = _a.sent();
                            return [4 /*yield*/, this.getCallsSettingsMessage(settings)];
                        case 3:
                            callsSettingsTemplate = _a.sent();
                            return [4 /*yield*/, this.markupButtonsService.callsSettingsMenuButtons(settings)];
                        case 4:
                            buttons = _a.sent();
                            if (!ctx.scene.state.replyMessageId) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.textService.updateMessage(ctx, callsSettingsTemplate, buttons, ctx.chat.id, ctx.scene.state.replyMessageId)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.updateTradeSettings = function (settingKey, telegramId, newValue) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = settingKey;
                            switch (_a) {
                                case 'minBuy': return [3 /*break*/, 1];
                                case 'maxBuy': return [3 /*break*/, 3];
                                case 'slippage': return [3 /*break*/, 5];
                                case 'priorityFee': return [3 /*break*/, 7];
                                case 'mevProtection': return [3 /*break*/, 9];
                                case 'withdrawWallet': return [3 /*break*/, 11];
                            }
                            return [3 /*break*/, 13];
                        case 1: return [4 /*yield*/, this.settingsService.updateMinBuy(telegramId, newValue)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 3: return [4 /*yield*/, this.settingsService.updateMaxBuy(telegramId, newValue)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 5: return [4 /*yield*/, this.settingsService.updateSlippage(telegramId, newValue)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 7: return [4 /*yield*/, this.settingsService.updatePriorityFee(telegramId, newValue)];
                        case 8:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 9: return [4 /*yield*/, this.settingsService.toggleMevProtection(telegramId)];
                        case 10:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 11: return [4 /*yield*/, this.settingsService.updateWithdrawWallet(telegramId, newValue)];
                        case 12:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 13: return [2 /*return*/, false];
                    }
                });
            });
        };
        SettingsWizard_1.prototype.updateCallsSettings = function (settingKey, telegramId, newValue) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = settingKey;
                            switch (_a) {
                                case 'minMarketCap': return [3 /*break*/, 1];
                                case 'maxMarketCap': return [3 /*break*/, 3];
                                case 'devWalletPercentage': return [3 /*break*/, 5];
                                case 'topHoldersRatio': return [3 /*break*/, 7];
                                case 'spikeVolumeThreshold': return [3 /*break*/, 9];
                                case 'whaleThreshold': return [3 /*break*/, 11];
                                case 'freezeStatus': return [3 /*break*/, 13];
                                case 'numberOfHoldersMin': return [3 /*break*/, 15];
                            }
                            return [3 /*break*/, 17];
                        case 1: return [4 /*yield*/, this.settingsService.updateMinMarketCap(telegramId, newValue)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 3: return [4 /*yield*/, this.settingsService.updateMaxMarketCap(telegramId, newValue)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 5: return [4 /*yield*/, this.settingsService.updateDevWalletPercentage(telegramId, newValue)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 7: return [4 /*yield*/, this.settingsService.updateTopHoldersRatio(telegramId, newValue)];
                        case 8:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 9: return [4 /*yield*/, this.settingsService.updateSpikeVolumeThreshold(telegramId, newValue)];
                        case 10:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 11: return [4 /*yield*/, this.settingsService.updateWhaleThreshold(telegramId, newValue)];
                        case 12:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 13: return [4 /*yield*/, this.settingsService.toggleFreezeStatus(telegramId)];
                        case 14:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 15: return [4 /*yield*/, this.settingsService.updateNumberOfHoldersMin(telegramId, newValue)];
                        case 16:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 17: return [2 /*return*/, false];
                    }
                });
            });
        };
        return SettingsWizard_1;
    }());
    __setFunctionName(_classThis, "SettingsWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _step0_decorators = [(0, nestjs_telegraf_1.WizardStep)(0)];
        _enterInputTradeSettings_decorators = [(0, nestjs_telegraf_1.WizardStep)(1)];
        _enterInputCallsSettings_decorators = [(0, nestjs_telegraf_1.WizardStep)(2)];
        _tradeSettings_decorators = [(0, nestjs_telegraf_1.Action)('trade_settings')];
        _callsSettings_decorators = [(0, nestjs_telegraf_1.Action)('calls_settings')];
        _backToMainMenu_decorators = [(0, nestjs_telegraf_1.Action)('back_to_main')];
        _askForMinBuyAmount_decorators = [(0, nestjs_telegraf_1.Action)('set_minBuy')];
        _askForMaxBuyAmount_decorators = [(0, nestjs_telegraf_1.Action)('set_maxBuy')];
        _askForSlippage_decorators = [(0, nestjs_telegraf_1.Action)('set_slippage')];
        _askForPriorityFee_decorators = [(0, nestjs_telegraf_1.Action)('set_priorityFee_amount')];
        _askForWithdrawWallet_decorators = [(0, nestjs_telegraf_1.Action)('set_withdraw_wallet')];
        _askForMinMarketCap_decorators = [(0, nestjs_telegraf_1.Action)('set_minMarketCap')];
        _askForMaxMarketCap_decorators = [(0, nestjs_telegraf_1.Action)('set_maxMarketCap')];
        _setTopHoldersHandler_decorators = [(0, nestjs_telegraf_1.Action)('set_topHolders')];
        _setDevWalletHandler_decorators = [(0, nestjs_telegraf_1.Action)('set_devWallet')];
        _setSpikeVolumeHandler_decorators = [(0, nestjs_telegraf_1.Action)('set_spike_volume')];
        _setWhaleDetectionHandler_decorators = [(0, nestjs_telegraf_1.Action)('set_whale_detection')];
        _askForNumberOfHoldersMin_decorators = [(0, nestjs_telegraf_1.Action)('set_numberOfHoldersMin')];
        _toggleFreezeStatus_decorators = [(0, nestjs_telegraf_1.Action)('set_freezeStatus')];
        _toggleMEVProtection_decorators = [(0, nestjs_telegraf_1.Action)('set_mevProtection')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        __esDecorate(_classThis, null, _step0_decorators, { kind: "method", name: "step0", static: false, private: false, access: { has: function (obj) { return "step0" in obj; }, get: function (obj) { return obj.step0; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enterInputTradeSettings_decorators, { kind: "method", name: "enterInputTradeSettings", static: false, private: false, access: { has: function (obj) { return "enterInputTradeSettings" in obj; }, get: function (obj) { return obj.enterInputTradeSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enterInputCallsSettings_decorators, { kind: "method", name: "enterInputCallsSettings", static: false, private: false, access: { has: function (obj) { return "enterInputCallsSettings" in obj; }, get: function (obj) { return obj.enterInputCallsSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _tradeSettings_decorators, { kind: "method", name: "tradeSettings", static: false, private: false, access: { has: function (obj) { return "tradeSettings" in obj; }, get: function (obj) { return obj.tradeSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _callsSettings_decorators, { kind: "method", name: "callsSettings", static: false, private: false, access: { has: function (obj) { return "callsSettings" in obj; }, get: function (obj) { return obj.callsSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _backToMainMenu_decorators, { kind: "method", name: "backToMainMenu", static: false, private: false, access: { has: function (obj) { return "backToMainMenu" in obj; }, get: function (obj) { return obj.backToMainMenu; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForMinBuyAmount_decorators, { kind: "method", name: "askForMinBuyAmount", static: false, private: false, access: { has: function (obj) { return "askForMinBuyAmount" in obj; }, get: function (obj) { return obj.askForMinBuyAmount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForMaxBuyAmount_decorators, { kind: "method", name: "askForMaxBuyAmount", static: false, private: false, access: { has: function (obj) { return "askForMaxBuyAmount" in obj; }, get: function (obj) { return obj.askForMaxBuyAmount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForSlippage_decorators, { kind: "method", name: "askForSlippage", static: false, private: false, access: { has: function (obj) { return "askForSlippage" in obj; }, get: function (obj) { return obj.askForSlippage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForPriorityFee_decorators, { kind: "method", name: "askForPriorityFee", static: false, private: false, access: { has: function (obj) { return "askForPriorityFee" in obj; }, get: function (obj) { return obj.askForPriorityFee; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForWithdrawWallet_decorators, { kind: "method", name: "askForWithdrawWallet", static: false, private: false, access: { has: function (obj) { return "askForWithdrawWallet" in obj; }, get: function (obj) { return obj.askForWithdrawWallet; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForMinMarketCap_decorators, { kind: "method", name: "askForMinMarketCap", static: false, private: false, access: { has: function (obj) { return "askForMinMarketCap" in obj; }, get: function (obj) { return obj.askForMinMarketCap; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForMaxMarketCap_decorators, { kind: "method", name: "askForMaxMarketCap", static: false, private: false, access: { has: function (obj) { return "askForMaxMarketCap" in obj; }, get: function (obj) { return obj.askForMaxMarketCap; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setTopHoldersHandler_decorators, { kind: "method", name: "setTopHoldersHandler", static: false, private: false, access: { has: function (obj) { return "setTopHoldersHandler" in obj; }, get: function (obj) { return obj.setTopHoldersHandler; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setDevWalletHandler_decorators, { kind: "method", name: "setDevWalletHandler", static: false, private: false, access: { has: function (obj) { return "setDevWalletHandler" in obj; }, get: function (obj) { return obj.setDevWalletHandler; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setSpikeVolumeHandler_decorators, { kind: "method", name: "setSpikeVolumeHandler", static: false, private: false, access: { has: function (obj) { return "setSpikeVolumeHandler" in obj; }, get: function (obj) { return obj.setSpikeVolumeHandler; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setWhaleDetectionHandler_decorators, { kind: "method", name: "setWhaleDetectionHandler", static: false, private: false, access: { has: function (obj) { return "setWhaleDetectionHandler" in obj; }, get: function (obj) { return obj.setWhaleDetectionHandler; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askForNumberOfHoldersMin_decorators, { kind: "method", name: "askForNumberOfHoldersMin", static: false, private: false, access: { has: function (obj) { return "askForNumberOfHoldersMin" in obj; }, get: function (obj) { return obj.askForNumberOfHoldersMin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleFreezeStatus_decorators, { kind: "method", name: "toggleFreezeStatus", static: false, private: false, access: { has: function (obj) { return "toggleFreezeStatus" in obj; }, get: function (obj) { return obj.toggleFreezeStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleMEVProtection_decorators, { kind: "method", name: "toggleMEVProtection", static: false, private: false, access: { has: function (obj) { return "toggleMEVProtection" in obj; }, get: function (obj) { return obj.toggleMEVProtection; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SettingsWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SettingsWizard = _classThis;
}();
exports.SettingsWizard = SettingsWizard;
