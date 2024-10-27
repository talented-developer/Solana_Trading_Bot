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
exports.StartWizard = void 0;
var nestjs_telegraf_1 = require("nestjs-telegraf");
var common_1 = require("@nestjs/common");
var StartWizard = function () {
    var _classDecorators = [(0, nestjs_telegraf_1.Wizard)('start'), (0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _step0_decorators;
    var _plan_decorators;
    var _backToStart_decorators;
    var _close_decorators;
    var StartWizard = _classThis = /** @class */ (function () {
        function StartWizard_1(i18n, userService, markupButtonsService, textService, utilsService) {
            this.i18n = (__runInitializers(this, _instanceExtraInitializers), i18n);
            this.userService = userService;
            this.markupButtonsService = markupButtonsService;
            this.textService = textService;
            this.utilsService = utilsService;
            this.logger = new common_1.Logger(this.constructor.name);
        }
        StartWizard_1.prototype.ensureUserExists = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = this.utilsService.getTelegramId(ctx);
                            return [4 /*yield*/, this.userService.getUserByTelegramId(telegramId)];
                        case 1:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 3];
                            this.logger.log("User not found. Creating new user with Telegram ID: ".concat(telegramId));
                            return [4 /*yield*/, this.userService.createUser({
                                    telegramId: telegramId,
                                    telegramFirstName: ctx.from.first_name,
                                    telegramUsername: ctx.from.username,
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        StartWizard_1.prototype.step0 = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var message, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.utilsService.checkAndLeaveWizard(ctx)];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.ensureUserExists(ctx)];
                        case 2:
                            _a.sent();
                            message = this.i18n.translate('i18n.menus.start.message');
                            return [4 /*yield*/, this.markupButtonsService.startMenuButtons()];
                        case 3:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.sendMessageWithButtons(ctx, message, buttons)];
                        case 4:
                            _a.sent();
                            ctx.wizard.selectStep(1);
                            return [2 /*return*/];
                    }
                });
            });
        };
        StartWizard_1.prototype.plan = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ctx.scene.leave()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, ctx.scene.enter('plan')];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        StartWizard_1.prototype.backToStart = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var startMenuMessage, buttons;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startMenuMessage = this.i18n.translate('i18n.menus.start.message');
                            return [4 /*yield*/, this.markupButtonsService.startMenuButtons()];
                        case 1:
                            buttons = _a.sent();
                            return [4 /*yield*/, this.textService.updateMessage(ctx, startMenuMessage, buttons, ctx.chat.id, ctx.callbackQuery.message.message_id)];
                        case 2:
                            _a.sent();
                            ctx.wizard.selectStep(1);
                            return [2 /*return*/];
                    }
                });
            });
        };
        StartWizard_1.prototype.close = function (ctx) {
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
        return StartWizard_1;
    }());
    __setFunctionName(_classThis, "StartWizard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _step0_decorators = [(0, nestjs_telegraf_1.WizardStep)(0)];
        _plan_decorators = [(0, nestjs_telegraf_1.Action)('plan')];
        _backToStart_decorators = [(0, nestjs_telegraf_1.Action)('back_to_start')];
        _close_decorators = [(0, nestjs_telegraf_1.Action)('close')];
        __esDecorate(_classThis, null, _step0_decorators, { kind: "method", name: "step0", static: false, private: false, access: { has: function (obj) { return "step0" in obj; }, get: function (obj) { return obj.step0; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _plan_decorators, { kind: "method", name: "plan", static: false, private: false, access: { has: function (obj) { return "plan" in obj; }, get: function (obj) { return obj.plan; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _backToStart_decorators, { kind: "method", name: "backToStart", static: false, private: false, access: { has: function (obj) { return "backToStart" in obj; }, get: function (obj) { return obj.backToStart; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StartWizard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StartWizard = _classThis;
}();
exports.StartWizard = StartWizard;
