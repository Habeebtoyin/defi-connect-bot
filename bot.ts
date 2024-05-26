import { Telegraf, Markup } from "telegraf";
import {
	Bot,
	Context,
	session,
	InlineKeyboard,
	webhookCallback,
	GrammyError,
	HttpError,
} from "grammy";
import { Menu } from "@grammyjs/menu";
import {
	conversations,
	createConversation,
	ConversationFn,
} from "@grammyjs/conversations";
import express = require("express");
import { buyToken, sellToken } from "./src/util/trade";
import { authUser, addToken, getUserTokenAndBalances } from "./src/util/api";
import { Wallet, getGasPrice, getWalletAddress } from "./src/util/blockchain";
// import { CreateWallet } from "./src/web3/wallet.web3";
import {
	BSC_RPC_URL,
	ETH_RPC_URL,
	BSC_TESTNET,
	ETH_TESTNET,
} from "./src/config";
import { ethers, isAddress } from "ethers";
import {
	BuyLimitConversation,
	sellLimitConversation,
	getOrders,
} from "./src/routes/limit-orders";
import { CreateWallet } from "./src/web3/wallet.web3";
// const bot: any = new Bot("5985510450:AAHiuCr6-_EahxR9Z0I6VYYg-1K3WfNRsOM", {
	const bot: any = new Bot("6913072721:AAH6z-6RjSHMrZ3p9D2D640TxkQlYyM-X2w", {

	client: {
		// We accept the drawback of webhook replies for typing status.
		canUseWebhookReply: (method) => method === "sendChatAction",
	},
});
const port = 8000;
const app = express();

app.use(express.json());

bot.use(session({ initial: () => ({ slippage: 0, chain: "", txWallet: "" }) }));
bot.use(conversations());

async function greeting(
	conversation: {
		wait: () => PromiseLike<{ message: any }> | { message: any };
	},
	ctx: { reply: (arg0: string) => any }
) {
	await ctx.reply("Hi there! What is your name?");
	const { message } = await conversation.wait();
	await ctx.reply(`Welcome to the chat, ${message.text}!`);
}

const selectScan = (chain: string) =>
	chain === "ETH" ? BSC_TESTNET : ETH_TESTNET;

const calculatePercentage = (walletBalance: string, percent: string) =>
	(parseFloat(walletBalance) * parseFloat(percent)) / 100;

async function withdrawTokenConversation(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: { otherwise: ((ctx: any) => any) | ((ctx: any) => any) }
		) => any;
		waitFor: (arg0: string) => any;
	},
	ctx: {
		from: { id: { toString: () => any } };
		reply: any;
	}
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
		// .text("ETH", "ETH");
		.text("ETH", "ETH");
	// await ctx.reply("Select Chain : (BSC/ETH)", {
		await ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: { reply: (arg0: string, arg1: any) => any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	await ctx.reply("Kindly input Recieving Wallet Address");
	const reAddressCtx = await conversation.waitFor(":text");
	ctx.reply("Kindly paste the contract address of the token to send out");
	let tokenAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(tokenAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		tokenAddressCtx = await conversation.waitFor(":text");
	}
	///check there token balance
	await ctx.reply("Kindly input Amount to send :");
	const amountCtx = await conversation.waitFor(":text");
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: { reply: (arg0: string, arg1: any) => any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
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
	const pbkey = await getWalletAddress(userData.pK1);
	const withdrawWallet = new Wallet(
		97,
		selectScan(ChainCtx.toUpperCase()).rpc,
		privateKey(),
		pbkey
	);
	withdrawWallet
		.sendErc20Token(
			reAddressCtx.msg.text,
			amountCtx.msg.text,
			tokenAddressCtx.msg.text
		)
		.then((res) => {
			console.log(res);
			ctx.reply("Sucessfully Sent");
			ctx.reply(
				`Transaction receipt : ${selectScan(ChainCtx).page}/tx/` +
					res.hash
			);
		})
		.catch((err) => {
			console.log(err.info.error.message);
			let error = JSON.parse(JSON.stringify(err));
			console.log({ error });
			ctx.reply(
				`Error Ocurred : \n ${err.info.error.message} \n ${error.code}`
			);
		});
}
async function withDrawEthConversation(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: {
				otherwise:
					| ((ctx: any) => any)
					| ((ctx: any) => any)
					| ((ctx: any) => any);
			}
		) => any;
		waitFor: (arg0: string) => any;
	},
	ctx: {
		from: { id: { toString: () => any } };
		reply: any;
	}
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
		// .text("ETH", "ETH");
		.text("ETH", "ETH");
	// ctx.reply("Select Chain : (BSC/ETH)", {
		ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: { reply: any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	ctx.reply("Kindly input Recieving Wallet Address");
	let reAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(reAddressCtx.msg.text)) {
		ctx.reply(
			"Not an Ethereum Address \n Kindly input Receiving Wallet Address:"
		);
		reAddressCtx = await conversation.waitFor(":text");
	}
	const keyboardAmount = new InlineKeyboard()
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
	const responseAmount = await conversation.waitForCallbackQuery(
		[
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
		],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
		}
	);
	const amountCtx = responseAmount.match;
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
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
	const pbkey = await getWalletAddress(privateKey());
	const withdrawWallet = new Wallet(
		97,
		selectScan(ChainCtx).rpc,
		privateKey(),
		pbkey
	);
	const withdrawWalletalance = await withdrawWallet.checkEthBalance();
	const amountToWithDraw = calculatePercentage(
		withdrawWalletalance,
		amountCtx
	).toFixed(4);
	//  console.log({ amountToWithDraw })
	ctx.reply("Sending funds to " + reAddressCtx.msg.text);
	await withdrawWallet
		.sendEth(reAddressCtx.msg.text, amountToWithDraw.toString())
		.then((res) => {
			ctx.reply("sucessfully sent");
			console.log({ res });
			ctx.reply(
				`Transaction receipt : ${
					selectScan(ChainCtx.toUpperCase()).page
				}/tx/` + res.hash
			);
		})
		.catch((err) => {
			console.log(err.info.error.message);
			let error = JSON.parse(JSON.stringify(err));
			console.log({ error });
			ctx.reply(
				`Error Ocurred : \n ${err.info.error.message} \n ${error.code}`
			);
		});
	//get amount amout to withdraw

	//get recieving Wallet
}
async function sellConversation(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: {
				otherwise:
					| ((ctx: any) => any)
					| ((ctx: any) => any)
					| ((ctx: any) => any)
					| ((ctx: any) => any);
			}
		) => any;
		waitFor: (arg0: string) => any;
	},
	ctx: { from?: any; reply: any }
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
		// .text("ETH", "ETH");
		.text("ETH", "ETH");
	// await ctx.reply("Select Chain : (BSC/ETH)", {
			await ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	await ctx.reply("Kindly input Sale Contract Address");
	let tokenAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(tokenAddressCtx.msg.text)) {
		await ctx.reply(
			"Not a a ETHdao Address \n Kindly input Token Contract Address:"
		);
		tokenAddressCtx = await conversation.waitFor(":text");
	}
	const keyboardAmount = new InlineKeyboard()
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
	await ctx.reply("Kindly input Sell Amount: (in ERC20): ", {
		reply_markup: keyboardAmount,
	});
	const responseAmount = await conversation.waitForCallbackQuery(
		[
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
		],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
		}
	);
	let amountCtx = responseAmount.match;
	const keyboardSlippage = new InlineKeyboard()
		.text("1%", "1")
		.text("2%", "2")
		.text("3%", "3")
		.text("5%", "5")
		.row()
		.text("10%", "10")
		.text("20%", "20")
		.text("30%", "30");
	await ctx.reply("Set Slippage :", { reply_markup: keyboardSlippage });
	const responseSlippage = await conversation.waitForCallbackQuery(
		["1", "2", "3", "10", "20", "5"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", {
					reply_markup: keyboardSlippage,
				}),
		}
	);
	const slippageCtx = responseSlippage.match;
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
	const walletCtx = response.match;
	//get chain

	const bscGasPrice = await getGasPrice(BSC_TESTNET.rpc);
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
	const walletAddress = await getWalletAddress(privateKey());
	const user = new Wallet(
		161221135,
		selectScan(ChainCtx.toUpperCase()).rpc,
		privateKey(),
		walletAddress
	);
	const tokenBalance = await user.checkErc20Balance(tokenAddressCtx.msg.text);
	const decimal = await user.getDecimals(tokenAddressCtx.msg.text);
	const amountToBuy = calculatePercentage(
		ethers.formatUnits(tokenBalance, decimal),
		amountCtx
	).toFixed(4);
	const data = {
		weth:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.weth
				: ETH_TESTNET.weth,
		tokenOut: tokenAddressCtx.msg.text,
		amount: amountToBuy,
		recipient: walletAddress,
		router:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.router
				: ETH_TESTNET.router,
		slippage: slippageCtx,
		rpc:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.rpc
				: ETH_TESTNET.rpc,
	};
	ctx.reply(`This is the current gasPrice ${bscGasPrice}`);
	ctx.reply(`Selling Token`);
	await sellToken(
		data.weth,
		data.tokenOut,
		data.amount,
		data.router,
		data.recipient,
		bscGasPrice,
		data.slippage,
		data.rpc,
		privateKey(),
		ctx,
		selectScan(ChainCtx).page
	);
	// .then(res => {
	//     console.log(res)
	// }).catch(err => {
	//     console.log(error)
	// })
}

async function buyConversation(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: {
				otherwise:
					| ((ctx: any) => any)
					| ((ctx: any) => any)
					| ((ctx: any) => any)
					| ((ctx: any) => any);
			}
		) => any;
		waitFor: (arg0: string) => any;
	},
	ctx: { from?: any; reply: any }
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
		// .text("ETH", "ETH");
		.text("ETH", "ETH");
	// await ctx.reply("Select Chain : (BSC/ETH)", {
		await ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	//token
	await ctx.reply("Kindly input Purchase Contract Address");
	let tokenAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(tokenAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		tokenAddressCtx = await conversation.waitFor(":text");
	}
	const keyboardAmount = new InlineKeyboard()
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
	// await ctx.reply("Kindly input Purchase Amount: (in BNB/ETH): ", {
		await ctx.reply("Kindly input Purchase Amount: (in ETH): ", {
		reply_markup: keyboardAmount,
	});
	const responseAmount = await conversation.waitForCallbackQuery(
		[
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
		],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardAmount }),
		}
	);
	let amountCtx = responseAmount.match;
	//slippage menu

	const keyboardSlippage = new InlineKeyboard()
		.text("1%", "1")
		.text("2%", "2")
		.text("3%", "3")
		.text("5%", "5")
		.row()
		.text("10%", "10")
		.text("20%", "20")
		.text("30%", "30");
	await ctx.reply("Set Slippage :", { reply_markup: keyboardSlippage });
	const responseSlippage = await conversation.waitForCallbackQuery(
		["1", "2", "3", "10", "20", "5"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) =>
				ctx.reply("Use the buttons!", {
					reply_markup: keyboardSlippage,
				}),
		}
	);
	const slippageCtx = responseSlippage.match;
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
	const walletCtx = response.match;
	//get chain

	console.log(
		tokenAddressCtx.msg.text,
		amountCtx,
		slippageCtx,
		ChainCtx,
		walletCtx
	);
	//check for gasFee, gas balance
	// const bscGasPrice = await getGasPrice(ETH_TESTNET.rpc);
	const bscGasPrice = await getGasPrice(BSC_TESTNET.rpc);

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
	const withdrawWallet = new Wallet(
		97,
		selectScan(ChainCtx).rpc,
		privateKey(),
		await getWalletAddress(privateKey())
	);
	const withdrawWalletalance = await withdrawWallet.checkEthBalance();
	const amountToBuy = calculatePercentage(
		withdrawWalletalance,
		amountCtx
	).toFixed(4);
	const data = {
		weth:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.weth
				: ETH_TESTNET.weth,
		tokenOut: tokenAddressCtx.msg.text,
		amount: amountToBuy,
		recipient: await getWalletAddress(privateKey()),
		router:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.router
				: ETH_TESTNET.router,
		slippage: slippageCtx,
		rpc:
			ChainCtx.toUpperCase() === "BSC"
				? BSC_TESTNET.rpc
				: ETH_TESTNET.rpc,
	};
	ctx.reply(`This is the current gasPrice ${bscGasPrice}`);
	ctx.reply(`Buying Token`);
	await buyToken(
		data.weth,
		data.tokenOut,
		data.amount,
		data.router,
		data.recipient,
		bscGasPrice,
		data.slippage,
		data.rpc,
		privateKey(),
		ctx,
		selectScan(ChainCtx).page
	);
	//execute tx nd return reciept
}
async function addTokenConversation(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: { otherwise: ((ctx: any) => any) | ((ctx: any) => any) }
		) => any;
		waitFor: (arg0: string) => any;
	},
	ctx: {
		from: { id: { toString: () => any } };
		reply: any;
	}
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
		// .text("ETH", "ETH");
		.text("ETH", "ETH");
	// await ctx.reply("Select Chain : (BSC/ETH)", {
		await ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: { reply: any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	await ctx.reply("Kindly input Token Contract Address");
	let tokenAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(tokenAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		tokenAddressCtx = await conversation.waitFor(":text");
	}
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: { reply: any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
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
	const walletAddress = await getWalletAddress(await privateKey());
	const chain = ChainCtx.toUpperCase();
	const tokenAddress = tokenAddressCtx.msg.text;
	await addToken(tokenAddress, walletAddress, chain, ctx, userId);
}
async function showTokenBalance(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: { otherwise: ((ctx: any) => any) | ((ctx: any) => any) }
		) => any;
	},
	ctx: {
		from: { id: { toString: () => any } };
		reply: any;
	}
) {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	const keyboardChain = new InlineKeyboard()
		// .text("BSC", "BSC")
	// 	.text("ETH", "ETH");
	// ctx.reply("Select Chain : (BSC/ETH)", {
		.text("ETH", "ETH");
		ctx.reply("Select Chain : (ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		// ["BSC", "ETH"],
		["ETH"],
		{
			otherwise: (ctx: { reply: any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);
	const ChainCtx = responseChain.match;
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: { reply: any }) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
	const walletCtx = response.match;
	//get chain

	const privateKey = async () => {
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
	const walletAddress = await getWalletAddress(await privateKey());
	const botUserTokens: any = await getUserTokenAndBalances(
		userId,
		walletAddress,
		ChainCtx
	);
	console.log(ChainCtx, walletCtx);
	console.log(botUserTokens);
	ctx.reply("Getting Token Balance");
	// const user = new Wallet(
	// 	161221135,
	// 	selectScan(ChainCtx.toUpperCase()).rpc,
	// 	 await privateKey(),
	// 	walletAddress
	// );
	// console.log(user);
	const user = new CreateWallet();

	if (botUserTokens.length > 0) {
		const TokenBalances = botUserTokens.map(
			async (token: { tokenAddress: any }) => {
				const { tokenAddress } = token;
				console.log(tokenAddress)
				// const balance = await user.checkErc20Balance(tokenAddress);
				// const symbol = await user.getSymbol(tokenAddress);
				// const decimal = await user.getDecimals(tokenAddress);
				const balance = await user.tokenBalanceOf(walletAddress, tokenAddress);
				const symbol = await user.getSymbol(tokenAddress);
				const decimal = await user.getDecimals(tokenAddress);
				ctx.reply(
					`Symbol: ${symbol} \n Balance:${ethers.formatUnits(
						balance,
						decimal
					)} \n TokenAddress: ${tokenAddress} \n Decimal: ${decimal}`
				);
			}
		);
	}
	if (botUserTokens.length === 0) {
		ctx.reply("No token Found Pls Add Token to This Wallet");
	}

	//getuser====>get user tokens and if none then start a conversation
}
async function testSell(
	conversation: {
		waitForCallbackQuery: (
			arg0: string[],
			arg1: { otherwise: (ctx: any) => any }
		) => any;
	},
	ctx: {
		reply: (arg0: string, arg1: { reply_markup: InlineKeyboard }) => any;
	}
) {
	const keyboard = new InlineKeyboard().text("A", "a").text("B", "b");
	await ctx.reply("A or B?", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(["a", "b"], {
		otherwise: (ctx: {
			reply: (
				arg0: string,
				arg1: { reply_markup: InlineKeyboard }
			) => any;
		}) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
	});
	if (response.match === "a") {
		// User picked "A".
	} else {
		// User picked "B".
	}
}
const menu = new Menu("my-menu-identifier")
	.text(
		"Buy",
		async (ctx: any) => await ctx.conversation.enter("buyConversation")
	)
	.text(
		"Sell",
		async (ctx: any) => await ctx.conversation.enter("sellConversation")
	)
	.row()
	.text(
		// "Withdraw ETH/BNB   ",
		"Withdraw ETH",
		async (ctx: any) =>
			await ctx.conversation.enter("withDrawEthConversation")
	)
	.row()
	.text(
		"Withdraw ERC20 Tokens",
		async (ctx: any) =>
			await ctx.conversation.enter("withdrawTokenConversation")
	)
	.row()
	.text(
		"Token Balances",
		async (ctx: any) => await ctx.conversation.enter("showTokenBalance")
	)
	.row()
	.text(
		"Add Token Contract",
		async (ctx: any) => await ctx.conversation.enter("addTokenConversation")
	)
	.row()
	// .text(
	// 	"Buy Limit",
	// 	async (ctx: any) => await ctx.conversation.enter("BuyLimitConversation")
	// )
	// .text(
	// 	"Sell Limit",
	// 	async (ctx: any) =>
	// 		await ctx.conversation.enter("sellLimitConversation")
	// )
	// .row()
	// .text(
	// 	"Orders",
	// 	async (ctx: any) => await ctx.conversation.enter("getOrders")
	// )
	// .row()
	// .text(
	// 	"Cancel Limit Orders",
	// 	async (ctx: any) => await ctx.conversation.enter("getOrders")
	// )
	// .row();
// .text("Test Sell", async (ctx) => await ctx.conversation.enter("testSell")).row()
bot.use(createConversation(greeting));
bot.use(createConversation(buyConversation as any));
bot.use(createConversation(sellConversation as any));
bot.use(createConversation(withDrawEthConversation as any));
bot.use(createConversation(withdrawTokenConversation as any));
bot.use(createConversation(addTokenConversation as any));
bot.use(createConversation(showTokenBalance as any));
bot.use(createConversation(BuyLimitConversation as any));
bot.use(createConversation(sellLimitConversation as any));
bot.use(createConversation(getOrders as any));
// bot.use(createConversation(testSell));
bot.use(menu);
// bot.use(composer);

bot.api.setMyCommands([
	{ command: "start", description: "Shows all wallet and dapps Options" },
	{ command: "help", description: "Contact our Help Channel" },
	{ command: "settings", description: "Change Wallet Settings and password" },
	{ command: "balance", description: "Shows all wallet balance" },
]);
bot.command("start", async (ctx: any) => {
	try {
		const userId = ctx.from.id.toString();
		const userData = await authUser(userId, ctx);
		if (userData) {
			const PublicKey = [
				await getWalletAddress(userData.pK1),
				await getWalletAddress(userData.pK2),
				await getWalletAddress(userData.pK3),
			];

			//get user

			// console.log({ userData })
			//get gas
			const bscGasPrice = await getGasPrice(BSC_TESTNET.rpc);
			const ethGasPrice = await getGasPrice(ETH_RPC_URL);
			// console.log(bscGasPrice, ethGasPrice, PublicKey)
			//get wallet Addressess
			// const bscWalletsBalances = [
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK1,
			// 		PublicKey[0]
			// 	).checkEthBalance(),
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK2,
			// 		PublicKey[1]
			// 	).checkEthBalance(),
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK3,
			// 		PublicKey[2]
			// 	).checkEthBalance(),
			// ];F
			const ethWalletsBalances = [
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK1,
					PublicKey[0]
				).checkEthBalance(),
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK2,
					PublicKey[1]
				).checkEthBalance(),
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK3,
					PublicKey[2]
				).checkEthBalance(),
			];
			// console.log(bscWalletsBalances);
			//get bsc and eth Balance

			const msg = `🤖Welcome to ETHBOT 🤖\n ⬩  ETH Gas ⛽️ :  ${ethGasPrice} GWEI \nSnipe & Swap with elite speed across multiple chains \n ═══ Your Wallets ═══  \n =====ETH Balance==== \n Wallet 1 \n ${PublicKey[0]} \n Balance:${ethWalletsBalances[0]} \n Wallet 2 \n ${PublicKey[1]} \n Balance:${ethWalletsBalances[1]} \n Wallet 3 \n ${PublicKey[2]} \n Balance:${ethWalletsBalances[2]} `;

			ctx.reply(msg, { reply_markup: menu });
		}
	} catch (error) {
		console.log({ error });
	}
});
bot.command("help", (ctx: { reply: (arg0: string) => any }) =>
	ctx.reply("Help Desk\n Coming Soon")
);


bot.command("delete", async (ctx: { reply: (arg0: string) => void }) => {
	ctx.reply(" See dashboard\n Coming Soon");
});
bot.command("settings", async (ctx: any) => {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
	if (userData) {
		const PublicKey = [
			await getWalletAddress(userData.pK1),
			await getWalletAddress(userData.pK2),
			await getWalletAddress(userData.pK3),
		];
		const msg = `🤖 ETHBOT Setting🤖\n⬩ ======= Wallets ======== \n Wallet 1 \n ${PublicKey[0]} \n Private Key \n:${userData.pK1} \n Wallet 2 \n ${PublicKey[1]} \n Private Key \n:${userData.pK2} \n Wallet 3 \n ${PublicKey[2]} \n Private Key \n:${userData.pK3} \n \n \n Kindly make sure to pls keep private key safe`;
		ctx.reply(msg);
	}
});
bot.command("updatePrivateKeys", async (ctx: any) => {
	const userId = ctx.from.id.toString();
	const userData = await authUser(userId, ctx);
});


bot.command("balance", async (ctx: any) => {
    try {
		const userId = ctx.from.id.toString();
		const userData = await authUser(userId, ctx);
		if (userData) {
			const PublicKey = [
				await getWalletAddress(userData.pK1),
				await getWalletAddress(userData.pK2),
				await getWalletAddress(userData.pK3),
			];

			//get user

			// console.log({ userData })
			//get gas
			const bscGasPrice = await getGasPrice(BSC_TESTNET.rpc);
			const ethGasPrice = await getGasPrice(ETH_RPC_URL);
			console.log(bscGasPrice, ethGasPrice, PublicKey)
			// get wallet Addressess
			// const bscWalletsBalances = [
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK1,
			// 		PublicKey[0]
			// 	).checkEthBalance(),
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK2,
			// 		PublicKey[1]
			// 	).checkEthBalance(),
			// 	await new Wallet(
			// 		97,
			// 		BSC_TESTNET.rpc,
			// 		userData.pK3,
			// 		PublicKey[2]
			// 	).checkEthBalance(),
			// ];
			const ethWalletsBalances = [
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK1,
					PublicKey[0]
				).checkEthBalance(),
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK2,
					PublicKey[1]
				).checkEthBalance(),
				await new Wallet(
					161221135,
					ETH_TESTNET.rpc,
					userData.pK3,
					PublicKey[2]
				).checkEthBalance(),
			];
			// console.log(bscWalletsBalances);
			//get bsc and eth Balance

			const msg = `🤖Welcome to ETHBOT 🤖\n⬩ BSC Gas ⛽️:  ${bscGasPrice} GWEI \n ⬩  ETH Gas ⛽️ :  ${ethGasPrice} GWEI \nSnipe & Swap with elite speed across multiple chains \n═══ Your Wallets ═══  \n =====ETH Balance==== \n Wallet 1 \n ${PublicKey[0]} \n Balance:${ethWalletsBalances[0]} \n Wallet 2 \n ${PublicKey[1]} \n Balance:${ethWalletsBalances[1]} \n Wallet 3 \n ${PublicKey[2]} \n Balance:${ethWalletsBalances[2]} `;

			ctx.reply(msg);
		}
	} catch (error) {
		console.log({ error });
	}

});


bot.catch((err: { ctx: any; error: any }) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e);
	} else {
		console.error("Unknown error:", e);
	}
});

function errorHandler(err: any) {
	console.error("Error in C!", err);
}

const webCall = webhookCallback(bot, "http");
bot.start();

app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));


