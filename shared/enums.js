"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raydiumAccounts = exports.TipAccounts = exports.SellActions = exports.BuyActions = exports.REFERRAL_TIERS = exports.SubscriptionPlanAmount = exports.PriorityFeeOption = void 0;
var PriorityFeeOption;
(function (PriorityFeeOption) {
    PriorityFeeOption["Medium"] = "\u270F Medium Fee";
    PriorityFeeOption["High"] = "\u270F High Fee";
    PriorityFeeOption["Ultimate"] = "\u270F Ultimate Fee";
    PriorityFeeOption["Custom"] = "\u270F Custom Fee";
})(PriorityFeeOption || (exports.PriorityFeeOption = PriorityFeeOption = {}));
var SubscriptionPlanAmount;
(function (SubscriptionPlanAmount) {
    SubscriptionPlanAmount[SubscriptionPlanAmount["Bronze"] = 0.01] = "Bronze";
    SubscriptionPlanAmount[SubscriptionPlanAmount["Silver"] = 99] = "Silver";
    SubscriptionPlanAmount[SubscriptionPlanAmount["Gold"] = 197] = "Gold";
})(SubscriptionPlanAmount || (exports.SubscriptionPlanAmount = SubscriptionPlanAmount = {}));
exports.REFERRAL_TIERS = [
    { level: 1, percent: 0.25 },
    { level: 2, percent: 0.035 },
    { level: 3, percent: 0.025 },
    { level: 4, percent: 0.02 },
    { level: 5, percent: 0.01 },
];
var BuyActions;
(function (BuyActions) {
    BuyActions["MinBuy"] = "min_buy";
    BuyActions["MaxBuy"] = "max_buy";
    BuyActions["Buy1Sol"] = "buy_1_sol";
    BuyActions["Buy2Sol"] = "buy_2_sol";
    BuyActions["Buy0_2Sol"] = "buy_0.2_sol";
    BuyActions["BuyXSol"] = "buy_x_sol";
})(BuyActions || (exports.BuyActions = BuyActions = {}));
var SellActions;
(function (SellActions) {
    SellActions["Sell10"] = "sell_10";
    SellActions["Sell25"] = "sell_25";
    SellActions["Sell100"] = "sell_100";
    SellActions["SellInitial"] = "sell_initial";
})(SellActions || (exports.SellActions = SellActions = {}));
var TipAccounts;
(function (TipAccounts) {
    TipAccounts["Account1"] = "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5";
    TipAccounts["Account2"] = "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe";
    TipAccounts["Account3"] = "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY";
    TipAccounts["Account4"] = "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49";
    TipAccounts["Account5"] = "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh";
    TipAccounts["Account6"] = "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt";
    TipAccounts["Account7"] = "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL";
    TipAccounts["Account8"] = "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT";
})(TipAccounts || (exports.TipAccounts = TipAccounts = {}));
var raydiumAccounts;
(function (raydiumAccounts) {
    raydiumAccounts["Account1"] = "FZRaADfoWG5B9mRH34wsANgHag1DJni3YksJWrweFeao";
})(raydiumAccounts || (exports.raydiumAccounts = raydiumAccounts = {}));
//# sourceMappingURL=enums.js.map