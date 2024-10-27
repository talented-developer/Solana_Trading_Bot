"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenMetadata = fetchTokenMetadata;
var js_1 = require("@metaplex-foundation/js");
var spl_token_registry_1 = require("@solana/spl-token-registry");
var web3_js_1 = require("@solana/web3.js");
var nestjs_i18n_1 = require("nestjs-i18n");
function fetchTokenMetadata(mintAddressPublicKeyStr_1) {
    return __awaiter(this, arguments, void 0, function (mintAddressPublicKeyStr, connection) {
        var metaplex, mintAddress, metadataPda, metadataAccountInfo, token, tokenName, tokenSymbol, tokenLogo, error_1, provider, tokenList, tokenMap, error_2, metadata;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        if (connection === void 0) { connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com'); }
        return __generator(this, function (_8) {
            switch (_8.label) {
                case 0:
                    metaplex = js_1.Metaplex.make(connection);
                    mintAddress = new web3_js_1.PublicKey(mintAddressPublicKeyStr);
                    metadataPda = metaplex
                        .nfts()
                        .pdas()
                        .metadata({ mint: mintAddress });
                    return [4 /*yield*/, connection.getAccountInfo(metadataPda)];
                case 1:
                    metadataAccountInfo = _8.sent();
                    if (!metadataAccountInfo) return [3 /*break*/, 6];
                    _8.label = 2;
                case 2:
                    _8.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, metaplex.nfts().findByMint({ mintAddress: mintAddress })];
                case 3:
                    token = _8.sent();
                    tokenName = token.name;
                    tokenSymbol = token.symbol;
                    tokenLogo = (_a = token.json) === null || _a === void 0 ? void 0 : _a.image;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _8.sent();
                    nestjs_i18n_1.logger.error('Error fetching token from Metaplex:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 9];
                case 6:
                    _8.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, new spl_token_registry_1.TokenListProvider().resolve()];
                case 7:
                    provider = _8.sent();
                    tokenList = provider.filterByChainId(spl_token_registry_1.ENV.MainnetBeta).getList();
                    tokenMap = tokenList.reduce(function (map, item) {
                        map.set(item.address, item);
                        return map;
                    }, new Map());
                    token = tokenMap.get(mintAddress.toBase58());
                    if (token) {
                        tokenName = token.name;
                        tokenSymbol = token.symbol;
                        tokenLogo = token.logoURI;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _8.sent();
                    nestjs_i18n_1.logger.error('Error fetching token list:', error_2);
                    return [3 /*break*/, 9];
                case 9:
                    metadata = {
                        model: (token === null || token === void 0 ? void 0 : token.model) || 'token',
                        updateAuthorityAddress: metadataAccountInfo ? new web3_js_1.PublicKey(metadataAccountInfo.data.slice(1, 33)).toBase58() : '',
                        json: {
                            name: ((_b = token === null || token === void 0 ? void 0 : token.json) === null || _b === void 0 ? void 0 : _b.name) || tokenName,
                            symbol: ((_c = token === null || token === void 0 ? void 0 : token.json) === null || _c === void 0 ? void 0 : _c.symbol) || tokenSymbol,
                            description: ((_d = token === null || token === void 0 ? void 0 : token.json) === null || _d === void 0 ? void 0 : _d.description) || '',
                            image: ((_e = token === null || token === void 0 ? void 0 : token.json) === null || _e === void 0 ? void 0 : _e.image) || tokenLogo || '',
                            showName: ((_f = token === null || token === void 0 ? void 0 : token.json) === null || _f === void 0 ? void 0 : _f.showName) || true,
                            createdOn: ((_g = token === null || token === void 0 ? void 0 : token.json) === null || _g === void 0 ? void 0 : _g.createdOn) || '',
                            twitter: ((_h = token === null || token === void 0 ? void 0 : token.json) === null || _h === void 0 ? void 0 : _h.twitter) || 'Twitter ❌',
                            telegram: ((_j = token === null || token === void 0 ? void 0 : token.json) === null || _j === void 0 ? void 0 : _j.telegram) || 'Telegram ❌',
                            website: ((_k = token === null || token === void 0 ? void 0 : token.json) === null || _k === void 0 ? void 0 : _k.website) || 'Website ❌',
                        },
                        jsonLoaded: (token === null || token === void 0 ? void 0 : token.jsonLoaded) || false,
                        name: (token === null || token === void 0 ? void 0 : token.name) || tokenName,
                        symbol: (token === null || token === void 0 ? void 0 : token.symbol) || tokenSymbol,
                        uri: (token === null || token === void 0 ? void 0 : token.uri) || '',
                        isMutable: (token === null || token === void 0 ? void 0 : token.isMutable) || false,
                        primarySaleHappened: (token === null || token === void 0 ? void 0 : token.primarySaleHappened) || false,
                        sellerFeeBasisPoints: (token === null || token === void 0 ? void 0 : token.sellerFeeBasisPoints) || 0,
                        editionNonce: (token === null || token === void 0 ? void 0 : token.editionNonce) || 255,
                        creators: ((token === null || token === void 0 ? void 0 : token.creators) || []).map(function (creator) { return ({
                            address: (creator === null || creator === void 0 ? void 0 : creator.address) ? new web3_js_1.PublicKey(creator.address).toBase58() : '',
                            verified: creator === null || creator === void 0 ? void 0 : creator.verified,
                            share: creator === null || creator === void 0 ? void 0 : creator.share,
                        }); }),
                        tokenStandard: (token === null || token === void 0 ? void 0 : token.tokenStandard) || 2,
                        collection: (token === null || token === void 0 ? void 0 : token.collection) || null,
                        collectionDetails: (token === null || token === void 0 ? void 0 : token.collectionDetails) || null,
                        uses: (token === null || token === void 0 ? void 0 : token.uses) || null,
                        programmableConfig: (token === null || token === void 0 ? void 0 : token.programmableConfig) || null,
                        address: mintAddress.toBase58(),
                        metadataAddress: metadataPda.toBase58(),
                        mint: {
                            model: ((_l = token === null || token === void 0 ? void 0 : token.mint) === null || _l === void 0 ? void 0 : _l.model) || 'mint',
                            address: mintAddress.toBase58(),
                            mintAuthorityAddress: ((_m = token === null || token === void 0 ? void 0 : token.mint) === null || _m === void 0 ? void 0 : _m.mintAuthorityAddress) ? new web3_js_1.PublicKey(token.mint.mintAuthorityAddress._bn).toBase58() : null,
                            freezeAuthorityAddress: ((_o = token === null || token === void 0 ? void 0 : token.mint) === null || _o === void 0 ? void 0 : _o.freezeAuthorityAddress) ? new web3_js_1.PublicKey(token.mint.freezeAuthorityAddress._bn).toBase58() : null,
                            decimals: ((_p = token === null || token === void 0 ? void 0 : token.mint) === null || _p === void 0 ? void 0 : _p.decimals) || 6,
                            supply: {
                                basisPoints: ((_r = (_q = token === null || token === void 0 ? void 0 : token.mint) === null || _q === void 0 ? void 0 : _q.supply) === null || _r === void 0 ? void 0 : _r.basisPoints) ? token.mint.supply.basisPoints.toString() : '0',
                                currency: {
                                    symbol: ((_u = (_t = (_s = token === null || token === void 0 ? void 0 : token.mint) === null || _s === void 0 ? void 0 : _s.supply) === null || _t === void 0 ? void 0 : _t.currency) === null || _u === void 0 ? void 0 : _u.symbol) || '',
                                    decimals: ((_x = (_w = (_v = token === null || token === void 0 ? void 0 : token.mint) === null || _v === void 0 ? void 0 : _v.supply) === null || _w === void 0 ? void 0 : _w.currency) === null || _x === void 0 ? void 0 : _x.decimals) || 0,
                                    namespace: ((_0 = (_z = (_y = token === null || token === void 0 ? void 0 : token.mint) === null || _y === void 0 ? void 0 : _y.supply) === null || _z === void 0 ? void 0 : _z.currency) === null || _0 === void 0 ? void 0 : _0.namespace) || '',
                                },
                            },
                            isWrappedSol: ((_1 = token === null || token === void 0 ? void 0 : token.mint) === null || _1 === void 0 ? void 0 : _1.isWrappedSol) || false,
                            currency: {
                                symbol: ((_3 = (_2 = token === null || token === void 0 ? void 0 : token.mint) === null || _2 === void 0 ? void 0 : _2.currency) === null || _3 === void 0 ? void 0 : _3.symbol) || '',
                                decimals: ((_5 = (_4 = token === null || token === void 0 ? void 0 : token.mint) === null || _4 === void 0 ? void 0 : _4.currency) === null || _5 === void 0 ? void 0 : _5.decimals) || 0,
                                namespace: ((_7 = (_6 = token === null || token === void 0 ? void 0 : token.mint) === null || _6 === void 0 ? void 0 : _6.currency) === null || _7 === void 0 ? void 0 : _7.namespace) || '',
                            },
                        },
                    };
                    return [2 /*return*/, metadata];
            }
        });
    });
}
