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
exports.HelpWizard = void 0;
var nestjs_telegraf_1 = require("nestjs-telegraf");
var common_1 = require("@nestjs/common");
var HelpWizard = function () {
    var _classDecorators = [(0, common_1.Injectable)(), (0, nestjs_telegraf_1.Wizard)('help')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _step0_decorators;
    var _faq_decorators;
    var _backToHelp_decorators;
    var _close_decorators;
    var HelpWizard = _classThis = /** @class */ (function () {
        function HelpWizard_1(i18n, markupButtonsService, textService) {
            this.i18n = (__runInitializers(this, _instanceExtraInitializers), i18n);
            this.markupButtonsService = markupButtonsService;
            this.textService = textService;
            this.logger = new common_1.Logger(this.constructor.name);
        }
        HelpWizard_1.prototype.getCommandDescriptions = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            startDescription: this.i18n.translate('i18n.commands_descriptions.start'),
                            helpDescription: this.i18n.translate('i18n.commands_descriptions.help'),
                            portfolioDescription: this.i18n.translate('i18n.commands_descriptions.portfolio'),
                            subscriptionDescription: this.i18n.translate('i18n.commands_descriptions.plan'),
                            referralDescription: this.i18n.translate('i18n.commands_descriptions.referral'),
                            settingsDescription: this.i18n.translate('i18n.commands_descriptions.settings'),
                            tradeDescription: this.i18n.translate('i18n.commands_descriptions.trade'),
                            walletDescription: this.i18n.translate('i18n.commands_descriptions.wallet'),
                            callsDescription: this.i18n.translate('i18n.commands_descriptions.calls'),
                        }];
                });
            });
        };
        HelpWizard_1.prototype.step0 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var descriptions, message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCommandDescriptions()];
                        case 1:
                            descriptions = _a.sent();
                            message = this.i18n.translate('i18n.menus.help.main_menu', { args: descriptions });
                            return [4 /*yield*/, this.markupButtonsService.helpMenuButtons()];
                        case 2:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 3:
                            _a.sent();
                            ctx.wizard.selectStep(1);
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        HelpWizard_1.prototype.faq = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var faq, message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            faq = this.i18n.translate('i18n.menus.help.faq');
                            message = "<b>".concat(faq.title, "</b>\n\n").concat(faq.questions.map(function (q) { return "<b>".concat(q.question, "</b>\n").concat(q.answer); }).join('\n\n'));
                            return [4 /*yield*/, this.markupButtonsService.faqMenuButtons()];
                        case 1:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.updateMessage(ctx, message, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 2:
                            _a.sent();
                            ctx.wizard.selectStep(2);
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        HelpWizard_1.prototype.backToHelp = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var descriptions, message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCommandDescriptions()];
                        case 1:
                            descriptions = _a.sent();
                            message = this.i18n.translate('i18n.menus.help.main_menu', { args: descriptions });
                            return [4 /*yield*/, this.markupButtonsService.helpMenuButtons()];
                        case 2:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.updateMessage(ctx, message, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 3:
                            _a.sent();
                            ctx.wizard.selectStep(1);
                            return [2 /*return*/];
                    }
                });
            });
        };
        //@ts-ignore
        HelpWizard_1.prototype.close = function (ctx) {
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
        return HelpWizard_1;
    }());
    __setFunctionName(_classThis, "HelpWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _step0_decorators = [(0, nestjs_telegraf_1.WizardStep)(0)];
        _faq_decorators = [(0, nestjs_telegraf_1.Action)('faq')];
        _backToHelp_decorators = [(0, nestjs_telegraf_1.Action)('back_to_help')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        __esDecorate(_classThis, null, _step0_decorators, { kind: "method", name: "step0", static: false, private: false, access: { has: function (obj) { return "step0" in obj; }, get: function (obj) { return obj.step0; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _faq_decorators, { kind: "method", name: "faq", static: false, private: false, access: { has: function (obj) { return "faq" in obj; }, get: function (obj) { return obj.faq; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _backToHelp_decorators, { kind: "method", name: "backToHelp", static: false, private: false, access: { has: function (obj) { return "backToHelp" in obj; }, get: function (obj) { return obj.backToHelp; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HelpWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HelpWizard = _classThis;
}();
exports.HelpWizard = HelpWizard;
