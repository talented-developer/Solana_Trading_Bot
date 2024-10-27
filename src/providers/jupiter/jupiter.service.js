"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterService = void 0;
var web3_js_1 = require("@solana/web3.js");
var common_1 = require("@nestjs/common");
var anchor_1 = require("@coral-xyz/anchor");
var bs58 = require("bs58");
var axios_1 = require("axios");
var enums_1 = require("@shared/enums");
var JupiterService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var JupiterService = _classThis = /** @class */ (function () {
        function JupiterService_1(jupiterAPI, transactionService, solanaService, configService) {
            this.jupiterAPI = jupiterAPI;
            this.transactionService = transactionService;
            this.solanaService = solanaService;
            this.configService = configService;
            this.logger = new common_1.Logger(this.constructor.name);
            this.feeAccountAddress = this.solanaService.getDeveloperFeePubkey().toBase58();
        }
        JupiterService_1.prototype.createWallet = function (userPrivateKey) {
            var secretKeyBuffer = bs58.decode(userPrivateKey);
            var secretKeyUint8Array = new Uint8Array(__spreadArray([], secretKeyBuffer, true));
            return new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(secretKeyUint8Array));
        };
        JupiterService_1.prototype.getSolPriceInUsdc = function () {
            return __awaiter(this, void 0, void 0, function () {
                var priceUrl, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            priceUrl = this.configService.get('blockchain.jupiter.priceUrl');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, axios_1.default.get("".concat(priceUrl, "/price?ids=SOL"))];
                        case 2:
                            response = _a.sent();
                            if (response.status === 200) {
                                this.logger.debug("Received SOL price: ".concat(response.data.data.SOL.price));
                                return [2 /*return*/, response.data.data.SOL.price];
                            }
                            else {
                                this.logger.error("Error retrieving SOL price: ".concat(response.status));
                                return [2 /*return*/, null];
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error("Error: ".concat(error_1.message));
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        JupiterService_1.prototype.performSwap = function (wallet, inputTokenAddress, outputTokenAddress, amountLamports, slippageBps, priorityFeeOption) {
            return __awaiter(this, void 0, void 0, function () {
                var quote, swapObj, transaction, txid, amountTokens, amountSol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jupiterAPI.fetchQuote(inputTokenAddress, outputTokenAddress, amountLamports, slippageBps, 100)];
                        case 1:
                            quote = _a.sent();
                            return [4 /*yield*/, this.jupiterAPI.createSwapTransaction(wallet, quote)];
                        case 2:
                            swapObj = _a.sent();
                            return [4 /*yield*/, this.solanaService.buildTransaction(wallet, swapObj.swapTransaction)];
                        case 3:
                            transaction = _a.sent();
                            transaction.sign([wallet.payer]);
                            return [4 /*yield*/, this.sendTransaction(transaction, priorityFeeOption)];
                        case 4:
                            txid = _a.sent();
                            if (!txid) {
                                this.logger.error('Failed to get transaction ID');
                                throw new Error('Failed to get transaction ID');
                            }
                            amountTokens = quote.outAmount.toString();
                            amountSol = (amountLamports / web3_js_1.LAMPORTS_PER_SOL).toString();
                            return [2 /*return*/, { txid: txid, amountTokens: amountTokens, amountSol: amountSol }];
                    }
                });
            });
        };
        JupiterService_1.prototype.sendTransaction = function (transaction, priorityFeeOption) {
            return __awaiter(this, void 0, void 0, function () {
                var serializedTransaction, requestBody, baseUrl, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            serializedTransaction = bs58.encode(transaction.serialize());
                            requestBody = {
                                jsonrpc: '2.0',
                                id: 1,
                                method: 'sendTransaction',
                                params: [serializedTransaction],
                                prioritizationFeeLamports: priorityFeeOption === enums_1.PriorityFeeOption.Auto ? { autoMultiplier: 1 } : 0,
                                dynamicComputeUnitLimit: true,
                            };
                            baseUrl = this.configService.get('blockchain.jito.baseUrl');
                            return [4 /*yield*/, axios_1.default.post("".concat(baseUrl, "/transactions"), requestBody, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                })];
                        case 1:
                            response = _a.sent();
                            this.logger.debug("Response: ".concat(JSON.stringify(response.data)));
                            if (!response.data.result) {
                                this.logger.error("Failed to send transaction: ".concat(response.statusText));
                                throw new Error("Failed to send transaction: ".concat(response.statusText));
                            }
                            return [2 /*return*/, response.data.result];
                    }
                });
            });
        };
        JupiterService_1.prototype.filterValidTokenAccounts = function (tokenAccounts) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenAddresses, prices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenAddresses = tokenAccounts.map(function (account) { return account.mintAddress; });
                            return [4 /*yield*/, this.solanaService.getTokenPricesInUsdc(tokenAddresses)];
                        case 1:
                            prices = _a.sent();
                            return [2 /*return*/, tokenAccounts
                                    .map(function (account) {
                                    var tokenBalanceInUsdc = prices[account.mintAddress];
                                    if (tokenBalanceInUsdc !== null) {
                                        return __assign(__assign({}, account), { tokenBalanceInUsdc: account.tokenBalance * tokenBalanceInUsdc });
                                    }
                                    return null;
                                })
                                    .filter(function (account) { return account !== null; })];
                    }
                });
            });
        };
        return JupiterService_1;
    }());
    __setFunctionName(_classThis, "JupiterService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JupiterService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JupiterService = _classThis;
}();
exports.JupiterService = JupiterService;
