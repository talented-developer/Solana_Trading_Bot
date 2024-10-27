"use strict";
/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.HttpClient = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType || (exports.ContentType = ContentType = {}));
var HttpClient = /** @class */ (function () {
    function HttpClient(apiConfig) {
        var _a;
        if (apiConfig === void 0) { apiConfig = {}; }
        var _this = this;
        this.baseUrl = "https://api.shyft.to/sol/v1";
        this.securityData = null;
        this.abortControllers = new Map();
        this.customFetch = function () {
            var fetchParams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fetchParams[_i] = arguments[_i];
            }
            return fetch.apply(void 0, fetchParams);
        };
        this.baseApiParams = {
            credentials: "same-origin",
            headers: {},
            redirect: "follow",
            referrerPolicy: "no-referrer",
        };
        this.setSecurityData = function (data) {
            _this.securityData = data;
        };
        this.contentFormatters = (_a = {},
            _a[ContentType.Json] = function (input) {
                return input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input;
            },
            _a[ContentType.Text] = function (input) { return (input !== null && typeof input !== "string" ? JSON.stringify(input) : input); },
            _a[ContentType.FormData] = function (input) {
                return Object.keys(input || {}).reduce(function (formData, key) {
                    var property = input[key];
                    formData.append(key, property instanceof Blob
                        ? property
                        : typeof property === "object" && property !== null
                            ? JSON.stringify(property)
                            : "".concat(property));
                    return formData;
                }, new FormData());
            },
            _a[ContentType.UrlEncoded] = function (input) { return _this.toQueryString(input); },
            _a);
        this.createAbortSignal = function (cancelToken) {
            if (_this.abortControllers.has(cancelToken)) {
                var abortController_1 = _this.abortControllers.get(cancelToken);
                if (abortController_1) {
                    return abortController_1.signal;
                }
                return void 0;
            }
            var abortController = new AbortController();
            _this.abortControllers.set(cancelToken, abortController);
            return abortController.signal;
        };
        this.abortRequest = function (cancelToken) {
            var abortController = _this.abortControllers.get(cancelToken);
            if (abortController) {
                abortController.abort();
                _this.abortControllers.delete(cancelToken);
            }
        };
        this.request = function (_a) { return __awaiter(_this, void 0, void 0, function () {
            var secureParams, _b, requestParams, queryString, payloadFormatter, responseFormat;
            var _this = this;
            var body = _a.body, secure = _a.secure, path = _a.path, type = _a.type, query = _a.query, format = _a.format, baseUrl = _a.baseUrl, cancelToken = _a.cancelToken, params = __rest(_a, ["body", "secure", "path", "type", "query", "format", "baseUrl", "cancelToken"]);
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
                            this.securityWorker;
                        if (!_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.securityWorker(this.securityData)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        secureParams = (_b) ||
                            {};
                        requestParams = this.mergeRequestParams(params, secureParams);
                        queryString = query && this.toQueryString(query);
                        payloadFormatter = this.contentFormatters[type || ContentType.Json];
                        responseFormat = format || requestParams.format;
                        return [2 /*return*/, this.customFetch("".concat(baseUrl || this.baseUrl || "").concat(path).concat(queryString ? "?".concat(queryString) : ""), __assign(__assign({}, requestParams), { headers: __assign(__assign({}, (requestParams.headers || {})), (type && type !== ContentType.FormData ? { "Content-Type": type } : {})), signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null, body: typeof body === "undefined" || body === null ? null : payloadFormatter(body) })).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                                var r, data, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            r = response.clone();
                                            r.data = null;
                                            r.error = null;
                                            if (!!responseFormat) return [3 /*break*/, 1];
                                            _a = r;
                                            return [3 /*break*/, 3];
                                        case 1: return [4 /*yield*/, response[responseFormat]()
                                                .then(function (data) {
                                                if (r.ok) {
                                                    r.data = data;
                                                }
                                                else {
                                                    r.error = data;
                                                }
                                                return r;
                                            })
                                                .catch(function (e) {
                                                r.error = e;
                                                return r;
                                            })];
                                        case 2:
                                            _a = _b.sent();
                                            _b.label = 3;
                                        case 3:
                                            data = _a;
                                            if (cancelToken) {
                                                this.abortControllers.delete(cancelToken);
                                            }
                                            if (!response.ok)
                                                throw data;
                                            return [2 /*return*/, data];
                                    }
                                });
                            }); })];
                }
            });
        }); };
        Object.assign(this, apiConfig);
    }
    HttpClient.prototype.encodeQueryParam = function (key, value) {
        var encodedKey = encodeURIComponent(key);
        return "".concat(encodedKey, "=").concat(encodeURIComponent(typeof value === "number" ? value : "".concat(value)));
    };
    HttpClient.prototype.addQueryParam = function (query, key) {
        return this.encodeQueryParam(key, query[key]);
    };
    HttpClient.prototype.addArrayQueryParam = function (query, key) {
        var _this = this;
        var value = query[key];
        return value.map(function (v) { return _this.encodeQueryParam(key, v); }).join("&");
    };
    HttpClient.prototype.toQueryString = function (rawQuery) {
        var _this = this;
        var query = rawQuery || {};
        var keys = Object.keys(query).filter(function (key) { return "undefined" !== typeof query[key]; });
        return keys
            .map(function (key) { return (Array.isArray(query[key]) ? _this.addArrayQueryParam(query, key) : _this.addQueryParam(query, key)); })
            .join("&");
    };
    HttpClient.prototype.addQueryParams = function (rawQuery) {
        var queryString = this.toQueryString(rawQuery);
        return queryString ? "?".concat(queryString) : "";
    };
    HttpClient.prototype.mergeRequestParams = function (params1, params2) {
        return __assign(__assign(__assign(__assign({}, this.baseApiParams), params1), (params2 || {})), { headers: __assign(__assign(__assign({}, (this.baseApiParams.headers || {})), (params1.headers || {})), ((params2 && params2.headers) || {})) });
    };
    return HttpClient;
}());
exports.HttpClient = HttpClient;
/**
 * @title Shyft V1
 * @version 1.0.0
 * @baseUrl https://api.shyft.to/sol/v1
 * @contact
 *
 * This API collection will enable you to speed up your web3 development on Solana.
 */
var Api = /** @class */ (function (_super) {
    __extends(Api, _super);
    function Api() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wallet = {
            /**
             * @description lets you check the balance in your solana wallet
             *
             * @tags Wallet
             * @name GetBalance
             * @summary Get Balance
             * @request GET:/wallet/balance
             */
            getBalance: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/balance", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description allows you to transfer SOL from your account to another.
             *
             * @tags Wallet
             * @name SendSol
             * @summary Send Sol
             * @request POST:/wallet/send_sol
             */
            sendSol: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/send_sol", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Get Token Balance
             *
             * @tags Wallet
             * @name GetTokenBalance
             * @summary Get Token Balance
             * @request GET:/wallet/token_balance
             */
            getTokenBalance: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/token_balance", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Get All Tokens Balance
             *
             * @tags Wallet
             * @name GetAllTokensBalance
             * @summary Get All Tokens Balance
             * @request GET:/wallet/all_tokens
             */
            getAllTokensBalance: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/all_tokens", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Get Portfolio
             *
             * @tags Wallet
             * @name GetPortfolio
             * @summary Get Portfolio
             * @request GET:/wallet/get_portfolio
             */
            getPortfolio: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/get_portfolio", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Get All Domains
             *
             * @tags Wallet
             * @name GetAllDomains
             * @summary Get All Domains
             * @request GET:/wallet/get_domains
             */
            getAllDomains: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/get_domains", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Resolve Address
             *
             * @tags Wallet
             * @name ResolveAddress
             * @summary Resolve Address
             * @request GET:/wallet/resolve_address
             */
            resolveAddress: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/resolve_address", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Sign Transaction
             *
             * @tags Wallet
             * @name SignTransaction
             * @summary Sign Transaction
             * @request POST:/wallet/sign_transaction
             */
            signTransaction: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/sign_transaction", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Transaction History
             *
             * @tags Wallet
             * @name TransactionHistory
             * @summary Transaction History
             * @request GET:/wallet/transaction_history
             */
            transactionHistory: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/transaction_history", method: "GET", query: query }, params));
            },
            /**
             * @description Send SOL Detached
             *
             * @tags Wallet
             * @name SendSolDetached
             * @summary Send SOL Detached
             * @request POST:/wallet/send_sol_detach
             */
            sendSolDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/send_sol_detach", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Create Semi Custodial Wallet
             *
             * @tags Semi Custodial Wallet
             * @name CreateSemiCustodialWallet
             * @summary Create Semi Custodial Wallet
             * @request POST:/wallet/create_semi_wallet/
             */
            createSemiCustodialWallet: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/create_semi_wallet/", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Get Keypair
             *
             * @tags Semi Custodial Wallet
             * @name GetKeypair
             * @summary Get Keypair
             * @request GET:/wallet/get_keypair
             */
            getKeypair: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/get_keypair", method: "GET", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Decrypt Semi Custodial Wallet
             *
             * @tags Semi Custodial Wallet
             * @name DecryptSemiCustodialWallet
             * @summary Decrypt Semi Custodial Wallet
             * @request GET:/wallet/decrypt_semi_wallet
             */
            decryptSemiCustodialWallet: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/wallet/decrypt_semi_wallet", method: "GET", body: data, type: ContentType.Json, format: "json" }, params));
            },
        };
        _this.nft = {
            /**
             * @description Mints an NFT into a wallet corresponding to the private key on blockchain. Wallet's public address is set as the update authority.
             *
             * @tags NFTs, Testing (Devnet/Testnet)
             * @name CreateNft
             * @summary Create NFT
             * @request POST:/nft/create
             */
            createNft: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/create", method: "POST", body: data, type: ContentType.FormData, format: "json" }, params));
            },
            /**
             * @description updates the properties and data associated to the nft
             *
             * @tags NFTs, Testing (Devnet/Testnet)
             * @name UpdateNft
             * @summary Update NFT
             * @request POST:/nft/update
             */
            updateNft: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/update", method: "POST", body: data, type: ContentType.FormData, format: "json" }, params));
            },
            /**
             * @description Burn/Delete an on-chain nft.
             *
             * @tags NFTs, Testing (Devnet/Testnet)
             * @name BurnNft
             * @summary Burn NFT
             * @request DELETE:/nft/burn
             */
            burnNft: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/burn", method: "DELETE", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Transfer NFT
             *
             * @tags NFTs, Testing (Devnet/Testnet)
             * @name TransferNft
             * @summary Transfer NFT
             * @request POST:/nft/transfer
             */
            transferNft: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/transfer", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Mint NFT
             *
             * @tags NFTs, Testing (Devnet/Testnet)
             * @name MintNft
             * @summary Mint NFT
             * @request POST:/nft/mint
             */
            mintNft: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/mint", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Create NFT Detached
             *
             * @tags NFTs
             * @name CreateNftDetached
             * @summary Create NFT Detached
             * @request POST:/nft/create_detach
             */
            createNftDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/create_detach", method: "POST", body: data, type: ContentType.FormData }, params));
            },
            /**
             * @description Mint NFT Detached
             *
             * @tags NFTs
             * @name MintNftDetached
             * @summary Mint NFT Detached
             * @request POST:/nft/mint_detach
             */
            mintNftDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/mint_detach", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Burn NFT Detached
             *
             * @tags NFTs
             * @name BurnNftDetached
             * @summary Burn NFT Detached
             * @request DELETE:/nft/burn_detach
             */
            burnNftDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/burn_detach", method: "DELETE", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Update NFT Detached
             *
             * @tags NFTs
             * @name UpdateNftDetached
             * @summary Update NFT Detached
             * @request POST:/nft/update_detach
             */
            updateNftDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/update_detach", method: "POST", body: data, type: ContentType.FormData }, params));
            },
            /**
             * @description Transfet NFT Detached
             *
             * @tags NFTs
             * @name TransfetNftDetached
             * @summary Transfet NFT Detached
             * @request POST:/nft/transfer_detach
             */
            transfetNftDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/transfer_detach", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Search
             *
             * @tags NFTs
             * @name Search
             * @summary Search
             * @request GET:/nft/search
             */
            search: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/search", method: "GET", query: query }, params));
            },
            /**
             * @description Read all the nfts from a wallet, or optionally all nfts with a paricular update_authority from a wallet
             *
             * @tags NFTs
             * @name ReadAllNfts
             * @summary Read All NFTs
             * @request GET:/nft/read_all
             */
            readAllNfts: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/read_all", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Get the properties, metadata and on-chain parameters of an already existing on-chian nft.
             *
             * @tags NFTs
             * @name ReadNft
             * @summary Read NFT
             * @request GET:/nft/read
             */
            readNft: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/nft/read", method: "GET", query: query, format: "json" }, params));
            },
        };
        _this.storage = {
            /**
             * @description Upload and store file on IPFS decentralized data storage.
             *
             * @tags Storage
             * @name UploadImage
             * @summary Upload Image
             * @request POST:/storage/upload
             */
            uploadImage: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/storage/upload", method: "POST", body: data, type: ContentType.FormData, format: "json" }, params));
            },
        };
        _this.token = {
            /**
             * @description Create Token
             *
             * @tags Fungible Tokens, Testing(Devnet/Testnet)
             * @name CreateToken
             * @summary Create Token
             * @request POST:/token/create
             */
            createToken: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/create", method: "POST", body: data, type: ContentType.FormData, format: "json" }, params));
            },
            /**
             * @description Mint Token
             *
             * @tags Fungible Tokens, Testing(Devnet/Testnet)
             * @name MintToken
             * @summary Mint Token
             * @request POST:/token/mint
             */
            mintToken: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/mint", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Burn Token
             *
             * @tags Fungible Tokens, Testing(Devnet/Testnet)
             * @name BurnToken
             * @summary Burn Token
             * @request DELETE:/token/burn
             */
            burnToken: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/burn", method: "DELETE", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Transfer Token
             *
             * @tags Fungible Tokens, Testing(Devnet/Testnet)
             * @name TransferToken
             * @summary Transfer Token
             * @request POST:/token/transfer
             */
            transferToken: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/transfer", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Get Token Info
             *
             * @tags Fungible Tokens
             * @name GetTokenInfo
             * @summary Get Token Info
             * @request GET:/token/get_info
             */
            getTokenInfo: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/get_info", method: "GET", query: query, format: "json" }, params));
            },
            /**
             * @description Create Token Detached
             *
             * @tags Fungible Tokens
             * @name CreateTokenDetached
             * @summary Create Token Detached
             * @request POST:/token/create_detach
             */
            createTokenDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/create_detach", method: "POST", body: data, type: ContentType.FormData }, params));
            },
            /**
             * @description Mint Token Detached
             *
             * @tags Fungible Tokens
             * @name MintTokenDetached
             * @summary Mint Token Detached
             * @request POST:/token/mint_detach
             */
            mintTokenDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/mint_detach", method: "POST", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Burn Token Detached
             *
             * @tags Fungible Tokens
             * @name BurnTokenDetached
             * @summary Burn Token Detached
             * @request DELETE:/token/burn_detach
             */
            burnTokenDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/burn_detach", method: "DELETE", body: data, type: ContentType.Json }, params));
            },
            /**
             * @description Transfer Token Detached
             *
             * @tags Fungible Tokens
             * @name TransferTokenDetached
             * @summary Transfer Token Detached
             * @request POST:/token/transfer_detach
             */
            transferTokenDetached: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/token/transfer_detach", method: "POST", body: data, type: ContentType.Json }, params));
            },
        };
        _this.marketplace = {
            /**
             * @description List
             *
             * @tags Marketplace, Listings
             * @name List
             * @summary List
             * @request POST:/marketplace/list
             * @secure
             */
            list: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/list", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Buy
             *
             * @tags Marketplace, Listings
             * @name Buy
             * @summary Buy
             * @request POST:/marketplace/buy
             * @secure
             */
            buy: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/buy", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Unlist
             *
             * @tags Marketplace, Listings
             * @name Unlist
             * @summary Unlist
             * @request POST:/marketplace/unlist
             * @secure
             */
            unlist: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/unlist", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Active Listings
             *
             * @tags Marketplace, Listings
             * @name ActiveListings
             * @summary Active Listings
             * @request GET:/marketplace/active_listings
             * @secure
             */
            activeListings: function (data, query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/active_listings", method: "GET", query: query, body: data, secure: true, type: ContentType.Text, format: "json" }, params));
            },
            /**
             * @description Get Listing Details
             *
             * @tags Marketplace, Listings
             * @name GetListingDetails
             * @summary Get Listing Details
             * @request GET:/marketplace/list_details
             * @secure
             */
            getListingDetails: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/list_details", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Seller Listings
             *
             * @tags Marketplace, Listings
             * @name SellerListings
             * @summary Seller Listings
             * @request GET:/marketplace/seller_listings
             * @secure
             */
            sellerListings: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/seller_listings", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Active Sellers
             *
             * @tags Marketplace, Listings
             * @name ActiveSellers
             * @summary Active Sellers
             * @request GET:/marketplace/active_sellers
             * @secure
             */
            activeSellers: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/active_sellers", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Order History
             *
             * @tags Marketplace, Listings
             * @name OrderHistory
             * @summary Order History
             * @request GET:/marketplace/buy_history
             * @secure
             */
            orderHistory: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/buy_history", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Create Marketplace
             *
             * @tags Marketplace
             * @name CreateMarketplace
             * @summary Create Marketplace
             * @request POST:/marketplace/create
             * @secure
             */
            createMarketplace: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/create", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Update Marketplace
             *
             * @tags Marketplace
             * @name UpdateMarketplace
             * @summary Update Marketplace
             * @request POST:/marketplace/update
             * @secure
             */
            updateMarketplace: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/update", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Withdraw Fees
             *
             * @tags Marketplace
             * @name WithdrawFees
             * @summary Withdraw Fees
             * @request POST:/marketplace/withdraw_fee
             * @secure
             */
            withdrawFees: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/withdraw_fee", method: "POST", body: data, secure: true, type: ContentType.Json, format: "json" }, params));
            },
            /**
             * @description Find Marketplace
             *
             * @tags Marketplace
             * @name FindMarketplace
             * @summary Find Marketplace
             * @request GET:/marketplace/find
             * @secure
             */
            findMarketplace: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/find", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Get Markets
             *
             * @tags Marketplace
             * @name GetMarkets
             * @summary Get Markets
             * @request GET:/marketplace/my_markets
             * @secure
             */
            getMarkets: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/my_markets", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Treasury Balance
             *
             * @tags Marketplace
             * @name TreasuryBalance
             * @summary Treasury Balance
             * @request GET:/marketplace/treasury_balance
             * @secure
             */
            treasuryBalance: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/treasury_balance", method: "GET", query: query, secure: true, format: "json" }, params));
            },
            /**
             * @description Marketplace stats
             *
             * @tags Marketplace
             * @name MarketplaceStats
             * @summary Marketplace stats
             * @request GET:/marketplace/stats
             * @secure
             */
            marketplaceStats: function (query, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/marketplace/stats", method: "GET", query: query, secure: true, format: "json" }, params));
            },
        };
        _this.getApiKey = {
            /**
             * @description This is the first API that you need to use and generate the `x-api-key`, used in the header for authentication of other api calls in this collection.
             *
             * @name GetApiKey
             * @summary Get API Key
             * @request POST:/get_api_key
             */
            getApiKey: function (data, params) {
                if (params === void 0) { params = {}; }
                return _this.request(__assign({ path: "/get_api_key", method: "POST", body: data, type: ContentType.Json, format: "json" }, params));
            },
        };
        return _this;
    }
    return Api;
}(HttpClient));
exports.Api = Api;
