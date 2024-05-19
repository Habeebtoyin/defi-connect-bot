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
const grammy_1 = require("grammy");
const menu_1 = require("@grammyjs/menu");
const conversations_1 = require("@grammyjs/conversations");
const express = require("express");
const trade_1 = require("./src/util/trade");
const api_1 = require("./src/util/api");
const blockchain_1 = require("./src/util/blockchain");
const config_1 = require("./src/config");
const ethers_1 = require("ethers");
const limit_orders_js_1 = require("./src/routes/limit-orders.js");
const bot = new grammy_1.Bot("5661676335:AAF1z0yuo2mr7fPr_-J2G0SI7mSc8HvQTog", {
    client: {
        // We accept the drawback of webhook replies for typing status.
        canUseWebhookReply: (method) => method === "sendChatAction",
    },
});
const port = 8000;
const app = express();
app.use(express.json());
bot.use((0, grammy_1.session)({ initial: () => ({ slippage: 0, chain: "", txWallet: "" }) }));
bot.use((0, conversations_1.conversations)());
function greeting(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("Hi there! What is your name?");
        const { message } = yield conversation.wait();
        yield ctx.reply(`Welcome to the chat, ${message.text}!`);
    });
}
const selectScan = (chain) => chain === "BSC" ? config_1.BSC_TESTNET : config_1.ETH_TESTNET;
const calculatePercentage = (walletBalance, percent) => (parseFloat(walletBalance) * parseFloat(percent)) / 100;
function withdrawTokenConversation(conversation, ctx) {
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
        yield ctx.reply("Kindly input Recieving Wallet Address");
        const reAddressCtx = yield conversation.waitFor(":text");
        ctx.reply("Kindly paste the contract address of the token to send out");
        let tokenAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(tokenAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            tokenAddressCtx = yield conversation.waitFor(":text");
        }
        ///check there token balance
        yield ctx.reply("Kindly input Amount to send :");
        const amountCtx = yield conversation.waitFor(":text");
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
        const pbkey = yield (0, blockchain_1.getWalletAddress)(userData.pK1);
        const withdrawWallet = new blockchain_1.Wallet(97, selectScan(ChainCtx.toUpperCase()).rpc, privateKey(), pbkey);
        withdrawWallet
            .sendErc20Token(reAddressCtx.msg.text, amountCtx.msg.text, tokenAddressCtx.msg.text)
            .then((res) => {
            console.log(res);
            ctx.reply("Sucessfully Sent");
            ctx.reply(`Transaction receipt : ${selectScan(ChainCtx).page}/tx/` +
                res.hash);
        })
            .catch((err) => {
            console.log(err.info.error.message);
            let error = JSON.parse(JSON.stringify(err));
            console.log({ error });
            ctx.reply(`Error Ocurred : \n ${err.info.error.message} \n ${error.code}`);
        });
    });
}
function withDrawEthConversation(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = ctx.from.id.toString();
        const userData = yield (0, api_1.authUser)(userId, ctx);
        const keyboardChain = new grammy_1.InlineKeyboard()
            .text("BSC", "BSC")
            .text("ETH", "ETH");
        ctx.reply("Select Chain : (BSC/ETH)", {
            reply_markup: keyboardChain,
        });
        const responseChain = yield conversation.waitForCallbackQuery(["BSC", "ETH"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
        });
        const ChainCtx = responseChain.match;
        ctx.reply("Kindly input Recieving Wallet Address");
        let reAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(reAddressCtx.msg.text)) {
            ctx.reply("Not an Ethereum Address \n Kindly input Receiving Wallet Address:");
            reAddressCtx = yield conversation.waitFor(":text");
        }
        const keyboardAmount = new grammy_1.InlineKeyboard()
            .text("0.5 %", "0.5")
            .text("1 %", "1")
            .text("10 %", "10")
            .row()
            .text("15 %", "15")
            .text("30 %", "30")
            .text("50 %", "50")
            .row()
            .text("55 %", "55")
            .text("60 %", "60")
            .text("70 %", "70")
            .row()
            .text("80 %", "80")
            .text("90 %", "90")
            .text("100 %", "98")
            .row();
        ctx.reply("Kindly input Amount to send: ", {
            reply_markup: keyboardAmount,
        });
        const responseAmount = yield conversation.waitForCallbackQuery([
            "0.5",
            "1",
            "1",
            "10",
            "15",
            "30",
            "50",
            "55",
            "60",
            "70",
            "80",
            "90",
            "98",
        ], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
        });
        const amountCtx = responseAmount.match;
        const keyboard = new grammy_1.InlineKeyboard()
            .text("Wallet 1", "w1")
            .text("Wallet 2", "w2")
            .text("Wallet 3", "w3");
        ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
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
        const pbkey = yield (0, blockchain_1.getWalletAddress)(privateKey());
        const withdrawWallet = new blockchain_1.Wallet(97, selectScan(ChainCtx).rpc, privateKey(), pbkey);
        const withdrawWalletalance = yield withdrawWallet.checkEthBalance();
        const amountToWithDraw = calculatePercentage(withdrawWalletalance, amountCtx).toFixed(4);
        //  console.log({ amountToWithDraw })
        ctx.reply("Sending funds to " + reAddressCtx.msg.text);
        yield withdrawWallet
            .sendEth(reAddressCtx.msg.text, amountToWithDraw.toString())
            .then((res) => {
            ctx.reply("sucessfully sent");
            console.log({ res });
            ctx.reply(`Transaction receipt : ${selectScan(ChainCtx.toUpperCase()).page}/tx/` + res.hash);
        })
            .catch((err) => {
            console.log(err.info.error.message);
            let error = JSON.parse(JSON.stringify(err));
            console.log({ error });
            ctx.reply(`Error Ocurred : \n ${err.info.error.message} \n ${error.code}`);
        });
        //get amount amout to withdraw
        //get recieving Wallet
    });
}
function sellConversation(conversation, ctx) {
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
        yield ctx.reply("Kindly input Sale Contract Address");
        let tokenAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(tokenAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            tokenAddressCtx = yield conversation.waitFor(":text");
        }
        const keyboardAmount = new grammy_1.InlineKeyboard()
            .text("0.5 %", "0.5")
            .text("1 %", "1")
            .text("10 %", "10")
            .row()
            .text("15 %", "15")
            .text("30 %", "30")
            .text("50 %", "50")
            .row()
            .text("55 %", "55")
            .text("60 %", "60")
            .text("70 %", "70")
            .row()
            .text("80 %", "80")
            .text("90 %", "90")
            .text("100 %", "98")
            .row();
        yield ctx.reply("Kindly input Sell Amount: (in BEP20/ERC20): ", {
            reply_markup: keyboardAmount,
        });
        const responseAmount = yield conversation.waitForCallbackQuery([
            "0.5",
            "1",
            "1",
            "10",
            "15",
            "30",
            "50",
            "55",
            "60",
            "70",
            "80",
            "90",
            "100",
        ], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
        });
        let amountCtx = responseAmount.match;
        const keyboardSlippage = new grammy_1.InlineKeyboard()
            .text("1%", "1")
            .text("2%", "2")
            .text("3%", "3")
            .text("5%", "5")
            .row()
            .text("10%", "10")
            .text("20%", "20")
            .text("30%", "30");
        yield ctx.reply("Set Slippage :", { reply_markup: keyboardSlippage });
        const responseSlippage = yield conversation.waitForCallbackQuery(["1", "2", "3", "10", "20", "5"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", {
                reply_markup: keyboardSlippage,
            }),
        });
        const slippageCtx = responseSlippage.match;
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
        const bscGasPrice = yield (0, blockchain_1.getGasPrice)(config_1.BSC_TESTNET.rpc);
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
        const walletAddress = yield (0, blockchain_1.getWalletAddress)(privateKey());
        const user = new blockchain_1.Wallet(1, selectScan(ChainCtx.toUpperCase()).rpc, privateKey(), walletAddress);
        const tokenBalance = yield user.checkErc20Balance(tokenAddressCtx.msg.text);
        const decimal = yield user.getDecimals(tokenAddressCtx.msg.text);
        const amountToBuy = calculatePercentage(ethers_1.ethers.formatUnits(tokenBalance, decimal), amountCtx).toFixed(4);
        const data = {
            weth: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.weth
                : config_1.ETH_TESTNET.weth,
            tokenOut: tokenAddressCtx.msg.text,
            amount: amountToBuy,
            recipient: walletAddress,
            router: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.router
                : config_1.ETH_TESTNET.router,
            slippage: slippageCtx,
            rpc: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.rpc
                : config_1.ETH_TESTNET.rpc,
        };
        ctx.reply(`This is the current gasPrice ${bscGasPrice}`);
        ctx.reply(`Selling Token`);
        yield (0, trade_1.sellToken)(data.weth, data.tokenOut, data.amount, data.router, data.recipient, bscGasPrice, data.slippage, data.rpc, privateKey(), ctx, selectScan(ChainCtx).page);
        // .then(res => {
        //     console.log(res)
        // }).catch(err => {
        //     console.log(error)
        // })
    });
}
function buyConversation(conversation, ctx) {
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
        //token
        yield ctx.reply("Kindly input Purchase Contract Address");
        let tokenAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(tokenAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            tokenAddressCtx = yield conversation.waitFor(":text");
        }
        const keyboardAmount = new grammy_1.InlineKeyboard()
            .text("0.5 %", "0.5")
            .text("1 %", "1")
            .text("10 %", "10")
            .row()
            .text("15 %", "15")
            .text("30 %", "30")
            .text("50 %", "50")
            .row()
            .text("55 %", "55")
            .text("60 %", "60")
            .text("70 %", "70")
            .row()
            .text("80 %", "80")
            .text("90 %", "90")
            .text("100 %", "98")
            .row();
        yield ctx.reply("Kindly input Purchase Amount: (in BNB/ETH): ", {
            reply_markup: keyboardAmount,
        });
        const responseAmount = yield conversation.waitForCallbackQuery([
            "0.5",
            "1",
            "1",
            "10",
            "15",
            "30",
            "50",
            "55",
            "60",
            "70",
            "80",
            "90",
            "100",
        ], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
        });
        let amountCtx = responseAmount.match;
        //slippage menu
        const keyboardSlippage = new grammy_1.InlineKeyboard()
            .text("1%", "1")
            .text("2%", "2")
            .text("3%", "3")
            .text("5%", "5")
            .row()
            .text("10%", "10")
            .text("20%", "20")
            .text("30%", "30");
        yield ctx.reply("Set Slippage :", { reply_markup: keyboardSlippage });
        const responseSlippage = yield conversation.waitForCallbackQuery(["1", "2", "3", "10", "20", "5"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", {
                reply_markup: keyboardSlippage,
            }),
        });
        const slippageCtx = responseSlippage.match;
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
        console.log(tokenAddressCtx.msg.text, amountCtx, slippageCtx, ChainCtx, walletCtx);
        //check for gasFee, gas balance
        const bscGasPrice = yield (0, blockchain_1.getGasPrice)(config_1.BSC_TESTNET.rpc);
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
        const withdrawWallet = new blockchain_1.Wallet(97, selectScan(ChainCtx).rpc, privateKey(), yield (0, blockchain_1.getWalletAddress)(privateKey()));
        const withdrawWalletalance = yield withdrawWallet.checkEthBalance();
        const amountToBuy = calculatePercentage(withdrawWalletalance, amountCtx).toFixed(4);
        const data = {
            weth: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.weth
                : config_1.ETH_TESTNET.weth,
            tokenOut: tokenAddressCtx.msg.text,
            amount: amountToBuy,
            recipient: yield (0, blockchain_1.getWalletAddress)(privateKey()),
            router: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.router
                : config_1.ETH_TESTNET.router,
            slippage: slippageCtx,
            rpc: ChainCtx.toUpperCase() === "BSC"
                ? config_1.BSC_TESTNET.rpc
                : config_1.ETH_TESTNET.rpc,
        };
        ctx.reply(`This is the current gasPrice ${bscGasPrice}`);
        ctx.reply(`Buying Token`);
        yield (0, trade_1.buyToken)(data.weth, data.tokenOut, data.amount, data.router, data.recipient, bscGasPrice, data.slippage, data.rpc, privateKey(), ctx, selectScan(ChainCtx).page);
        //execute tx nd return reciept
    });
}
function addTokenConversation(conversation, ctx) {
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
        yield ctx.reply("Kindly input Token Contract Address");
        let tokenAddressCtx = yield conversation.waitFor(":text");
        if (!(0, ethers_1.isAddress)(tokenAddressCtx.msg.text)) {
            yield ctx.reply("Not an Ethereum Address \n Kindly input Token Contract Address:");
            tokenAddressCtx = yield conversation.waitFor(":text");
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
        console.log(walletCtx, ChainCtx);
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
        const chain = ChainCtx.toUpperCase();
        const tokenAddress = tokenAddressCtx.msg.text;
        yield (0, api_1.addToken)(tokenAddress, walletAddress, chain, ctx, userId);
    });
}
function showTokenBalance(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = ctx.from.id.toString();
        const userData = yield (0, api_1.authUser)(userId, ctx);
        const keyboardChain = new grammy_1.InlineKeyboard()
            .text("BSC", "BSC")
            .text("ETH", "ETH");
        ctx.reply("Select Chain : (BSC/ETH)", {
            reply_markup: keyboardChain,
        });
        const responseChain = yield conversation.waitForCallbackQuery(["BSC", "ETH"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
        });
        const ChainCtx = responseChain.match;
        const keyboard = new grammy_1.InlineKeyboard()
            .text("Wallet 1", "w1")
            .text("Wallet 2", "w2")
            .text("Wallet 3", "w3");
        ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
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
        const botUserTokens = yield (0, api_1.getUserTokenAndBalances)(userId, walletAddress, 1, ChainCtx);
        console.log(ChainCtx, walletCtx);
        ctx.reply("Getting Token Balance");
        const user = new blockchain_1.Wallet(1, selectScan(ChainCtx.toUpperCase()).rpc, privateKey(), walletAddress);
        if (botUserTokens.length > 0) {
            const TokenBalances = botUserTokens.map((token) => __awaiter(this, void 0, void 0, function* () {
                const { tokenAddress } = token;
                //console.log(tokenAddress)
                const balance = yield user.checkErc20Balance(tokenAddress);
                const symbol = yield user.getSymbol(tokenAddress);
                const decimal = yield user.getDecimals(tokenAddress);
                ctx.reply(`Symbol: ${symbol} \n Balance:${ethers_1.ethers.formatUnits(balance, decimal)} \n TokenAddress: ${tokenAddress} \n Decimal: ${decimal}`);
            }));
        }
        if (botUserTokens.length === 0) {
            ctx.reply("Not token Found Pls Add Token to This Wallet");
        }
        //getuser====>get user tokens and if none then start a conversation
    });
}
function testSell(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyboard = new grammy_1.InlineKeyboard().text("A", "a").text("B", "b");
        yield ctx.reply("A or B?", { reply_markup: keyboard });
        const response = yield conversation.waitForCallbackQuery(["a", "b"], {
            otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
        });
        if (response.match === "a") {
            // User picked "A".
        }
        else {
            // User picked "B".
        }
    });
}
const menu = new menu_1.Menu("my-menu-identifier")
    .text("Buy", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("buyConversation"); }))
    .text("Sell", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("sellConversation"); }))
    .row()
    .text("Withdraw ETH/BNB   ", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("withDrawEthConversation"); }))
    .row()
    .text("Withdraw ERC20/BEP20 Tokens", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("withdrawTokenConversation"); }))
    .row()
    .text("Token Balances", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("showTokenBalance"); }))
    .row()
    .text("Add Token Contract", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("addTokenConversation"); }))
    .row()
    .text("Buy Limit", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("BuyLimitConversation"); }))
    .text("Sell Limit", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("addTokenConversation"); }))
    .row()
    .text("Orders", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("addTokenConversation"); }))
    .row()
    .text("Cancel Limit Orders", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.conversation.enter("addTokenConversation"); }))
    .row();
// .text("Test Sell", async (ctx) => await ctx.conversation.enter("testSell")).row()
bot.use((0, conversations_1.createConversation)(greeting));
bot.use((0, conversations_1.createConversation)(buyConversation));
bot.use((0, conversations_1.createConversation)(sellConversation));
bot.use((0, conversations_1.createConversation)(withDrawEthConversation));
bot.use((0, conversations_1.createConversation)(withdrawTokenConversation));
bot.use((0, conversations_1.createConversation)(addTokenConversation));
bot.use((0, conversations_1.createConversation)(showTokenBalance));
bot.use((0, conversations_1.createConversation)(limit_orders_js_1.BuyLimitConversation));
// bot.use(createConversation(testSell));
bot.use(menu);
// bot.use(composer);
bot.api.setMyCommands([
    { command: "start", description: "Shows all wallet and dapps Options" },
    { command: "help", description: "Contact our Help Channel" },
    { command: "settings", description: "Change Wallet Settings and password" },
    { command: "balance", description: "Shows all wallet balance" },
]);
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = ctx.from.id.toString();
        const userData = yield (0, api_1.authUser)(userId, ctx);
        if (userData) {
            const PublicKey = [
                yield (0, blockchain_1.getWalletAddress)(userData.pK1),
                yield (0, blockchain_1.getWalletAddress)(userData.pK2),
                yield (0, blockchain_1.getWalletAddress)(userData.pK3),
            ];
            //get user
            // console.log({ userData })
            //get gas
            const bscGasPrice = yield (0, blockchain_1.getGasPrice)(config_1.BSC_TESTNET.rpc);
            const ethGasPrice = yield (0, blockchain_1.getGasPrice)(config_1.ETH_RPC_URL);
            // console.log(bscGasPrice, ethGasPrice, PublicKey)
            //get wallet Addressess
            const bscWalletsBalances = [
                yield new blockchain_1.Wallet(97, config_1.BSC_TESTNET.rpc, userData.pK1, PublicKey[0]).checkEthBalance(),
                yield new blockchain_1.Wallet(97, config_1.BSC_TESTNET.rpc, userData.pK2, PublicKey[1]).checkEthBalance(),
                yield new blockchain_1.Wallet(97, config_1.BSC_TESTNET.rpc, userData.pK3, PublicKey[2]).checkEthBalance(),
            ];
            const ethWalletsBalances = [
                yield new blockchain_1.Wallet(1, config_1.ETH_TESTNET.rpc, userData.pK1, PublicKey[0]).checkEthBalance(),
                yield new blockchain_1.Wallet(1, config_1.ETH_TESTNET.rpc, userData.pK2, PublicKey[1]).checkEthBalance(),
                yield new blockchain_1.Wallet(1, config_1.ETH_TESTNET.rpc, userData.pK3, PublicKey[2]).checkEthBalance(),
            ];
            console.log(bscWalletsBalances);
            //get bsc and eth Balance
            const msg = `🤖Welcome to 100xbot 🤖\n⬩ BSC Gas ⛽️:  ${bscGasPrice} GWEI \n ⬩  ETH Gas ⛽️ :  ${ethGasPrice} GWEI \nSnipe & Swap with elite speed across multiple chains\n \n═══ Your Wallets ═══ \n ===BSC Balance=== \n Wallet 1 \n ${PublicKey[0]} \n Balance:${bscWalletsBalances[0]} \n Wallet 2 \n ${PublicKey[1]} \n Balance:${bscWalletsBalances[1]} \n Wallet 3 \n ${PublicKey[2]} \n Balance:${bscWalletsBalances[2]} \n \n =====ETH Balance==== \n Wallet 1 \n ${PublicKey[0]} \n Balance:${ethWalletsBalances[0]} \n Wallet 2 \n ${PublicKey[1]} \n Balance:${ethWalletsBalances[1]} \n Wallet 3 \n ${PublicKey[2]} \n Balance:${ethWalletsBalances[2]} `;
            ctx.reply(msg, { reply_markup: menu });
        }
    }
    catch (error) {
        console.log({ error });
    }
}));
bot.command("help", (ctx) => ctx.reply("Help Desk\n Coming Soon"));
bot.command("delete", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(" See dashboard\n Coming Soon");
}));
bot.command("settings", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id.toString();
    const userData = yield (0, api_1.authUser)(userId, ctx);
    if (userData) {
        const PublicKey = [
            yield (0, blockchain_1.getWalletAddress)(userData.pK1),
            yield (0, blockchain_1.getWalletAddress)(userData.pK2),
            yield (0, blockchain_1.getWalletAddress)(userData.pK3),
        ];
        const msg = `🤖 100xbot Setting🤖\n⬩ ======= Wallets ======== \n Wallet 1 \n ${PublicKey[0]} \n Private Key \n:${userData.pK1} \n Wallet 2 \n ${PublicKey[1]} \n Private Key \n:${userData.pK2} \n Wallet 3 \n ${PublicKey[2]} \n Private Key \n:${userData.pK3} \n \n \n Kindly make sure to pls keep private key safe`;
        ctx.reply(msg);
    }
}));
bot.command("updatePrivateKeys", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id.toString();
    const userData = yield (0, api_1.authUser)(userId, ctx);
}));
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
});
function errorHandler(err) {
    console.error("Error in C!", err);
}
const webCall = (0, grammy_1.webhookCallback)(bot, "http");
bot.start();
app.use(`/${bot.token}`, (0, grammy_1.webhookCallback)(bot, "express"));
app.use((_req, res) => res.status(200).send());
app.listen(port, () => console.log(`listening on port ${port}`));
