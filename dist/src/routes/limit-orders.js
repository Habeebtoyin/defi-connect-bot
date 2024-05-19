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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyLimitConversation = exports.composer = void 0;
const grammy_1 = require("grammy");
const api_1 = require("../util/api");
const blockchain_1 = require("../util/blockchain");
const ethers_1 = require("ethers");
const config_1 = require("../config");
exports.composer = new grammy_1.Composer();
function testComposer(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = ctx.from.id.toString();
        console.log(userId);
    });
}
/**
 *
 * network,
    makerAssetAddress,
    takerAssetAddress,
    makerAmount,
    takerAmount,
    expiration
 */
const selectScan = (chain) => chain === "BSC" ? config_1.BSC_TESTNET : config_1.ETH_TESTNET;
function BuyLimitConversation(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = ctx.from.id.toString();
        const userData = yield (0, api_1.authUser)(userId, ctx);
        const keyboardChain = new grammy_1.InlineKeyboard()
            .text("BSC", "BSC")
            .text("ETH", "ETH");
        yield ctx.reply("Select Chain : (BSC/ETH)", {
            reply_markup: keyboardChain,
        });
        const responseChain = yield conversation.waitForCallbackQuery(["BSC", "ETH"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
        });
        const ChainCtx = responseChain.match;
        yield ctx.reply("Kindly input Maker Token Address");
        let makerAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(makerAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            makerAddressCtx = yield conversation.waitFor(":text");
        }
        yield ctx.reply("Kindly input Taker Token Address");
        let takerAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(takerAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            takerAddressCtx = yield conversation.waitFor(":text");
        }
        const keyboard = new grammy_1.InlineKeyboard()
            .text("Wallet 1", "w1")
            .text("Wallet 2", "w2")
            .text("Wallet 3", "w3");
        yield ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
        const response = yield conversation.waitForCallbackQuery(["w1", "w2", "w3"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
        });
        const walletCtx = response.match;
        //get chain
        const privateKey = () => {
            switch (walletCtx.toLowerCase()) {
                case "w1":
                    return userData.pK1;
                case "w2":
                    return userData.pK2;
                case "w3":
                    return userData.pK3;
                default:
                    break;
            }
        };
        const walletAddress = yield (0, blockchain_1.getWalletAddress)(yield privateKey());
        const user = new blockchain_1.Wallet(1, selectScan(ChainCtx.toUpperCase()).rpc, privateKey(), walletAddress);
        const keyboardTime = new grammy_1.InlineKeyboard()
            .text("30 min", "")
            .text("1  hour", "w2")
            .row()
            .text("2 hours", "w3")
            .text("7 hours", "w3")
            .row()
            .text("10 hours", "")
            .text("1  day", "w2")
            .row()
            .text("2 days", "w3")
            .text("7 days", "w3")
            .row();
        yield ctx.reply("Set Buy limit Duration:", { reply_markup: keyboardTime });
        //get marker token
        // display masker token data {symbol,decimal and balance}
        //get amount of maker assset to user
        // same for taker assets
        //expiration time
        //user privatekey to send transaction
    });
}
exports.BuyLimitConversation = BuyLimitConversation;
exports.composer.command("limits", testComposer);
module.exports = { composer: exports.composer, BuyLimitConversation };
