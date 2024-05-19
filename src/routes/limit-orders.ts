import { Composer, InlineKeyboard } from "grammy";
import { authUser, addToken, getUserTokenAndBalances } from "../util/api";
import { Wallet, getGasPrice, getWalletAddress } from "../util/blockchain";
import { ethers, isAddress } from "ethers";
import { BSC_TESTNET, ETH_TESTNET } from "../config";
export const composer: any = new Composer();

async function testComposer(ctx: { from: { id: { toString: () => any } } }) {
	const userId = ctx.from.id.toString();
	console.log(userId);
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
const selectScan = (chain: string) =>
	chain === "BSC" ? BSC_TESTNET : ETH_TESTNET;
export async function BuyLimitConversation(
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
		.text("BSC", "BSC")
		.text("ETH", "ETH");
	await ctx.reply("Select Chain : (BSC/ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		["BSC", "ETH"],
		{
			otherwise: (ctx: {
				reply: (arg0: string, arg1: { reply_markup: any }) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);

	const ChainCtx = responseChain.match;
	await ctx.reply("Kindly input Maker Token Address");
	let makerAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(makerAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		makerAddressCtx = await conversation.waitFor(":text");
	}
	await ctx.reply("Kindly input Taker Token Address");
	let takerAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(takerAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		takerAddressCtx = await conversation.waitFor(":text");
	}
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: {
				reply: (arg0: string, arg1: { reply_markup: any }) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
		}
	);
	const walletCtx = response.match;
	const keyboardTime = new InlineKeyboard()
		.text("30 min", "30m")
		.text("1  hour", "1h")
		.row()
		.text("2 hours", "2h")
		.text("7 hours", "7h")
		.row()
		.text("10 hours", "10h")
		.text("1  day", "1d")
		.row()
		.text("2 days", "2d")
		.text("7 days", "7d")
		.row();
	const responseTime = await conversation.waitForCallbackQuery(
		["30m", "1h", "2h", "7h", "10h", "1d", "2d", "7d"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboardTime }),
		}
	);
	const time = responseTime.match;
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
	const walletAddress = await getWalletAddress(await privateKey());
	const user = new Wallet(
		1,
		selectScan(ChainCtx.toUpperCase()).rpc,
		privateKey(),
		walletAddress
	);

	ctx.reply(
		"Error 1INCHERROR: unable to call limit function, INTERNAL-JSON-RPC"
	);
}

export async function getOrders(
	conversation: any,
	ctx: { reply: (arg0: string) => void }
) {
	ctx.reply("Unable to fetch order");
}

export async function sellLimitConversation(
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
		.text("BSC", "BSC")
		.text("ETH", "ETH");
	await ctx.reply("Select Chain : (BSC/ETH)", {
		reply_markup: keyboardChain,
	});
	const responseChain = await conversation.waitForCallbackQuery(
		["BSC", "ETH"],
		{
			otherwise: (ctx: {
				reply: (arg0: string, arg1: { reply_markup: any }) => any;
			}) =>
				ctx.reply("Use the buttons!", { reply_markup: keyboardChain }),
		}
	);

	const ChainCtx = responseChain.match;
	await ctx.reply("Kindly input Maker Token Address");
	let makerAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(makerAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		makerAddressCtx = await conversation.waitFor(":text");
	}
	await ctx.reply("Kindly input Taker Token Address");
	let takerAddressCtx = await conversation.waitFor(":text");
	if (!isAddress(takerAddressCtx.msg.text)) {
		await ctx.reply(
			"Not an Ethereum Address \n Kindly input Token Contract Address:"
		);
		takerAddressCtx = await conversation.waitFor(":text");
	}
	const keyboard = new InlineKeyboard()
		.text("Wallet 1", "w1")
		.text("Wallet 2", "w2")
		.text("Wallet 3", "w3");
	await ctx.reply("Set Wallet: (w1/w2/w3)", { reply_markup: keyboard });
	const response = await conversation.waitForCallbackQuery(
		["w1", "w2", "w3"],
		{
			otherwise: (ctx: {
				reply: (arg0: string, arg1: { reply_markup: any }) => any;
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
	const keyboardTime = new InlineKeyboard()
		.text("30 min", "30m")
		.text("1  hour", "1h")
		.row()
		.text("2 hours", "2h")
		.text("7 hours", "7h")
		.row()
		.text("10 hours", "10h")
		.text("1  day", "1d")
		.row()
		.text("2 days", "2d")
		.text("7 days", "7d")
		.row();
	const responseTime = await conversation.waitForCallbackQuery(
		["30m", "1h", "2h", "7h", "10h", "1d", "2d", "7d"],
		{
			otherwise: (ctx: {
				reply: (
					arg0: string,
					arg1: { reply_markup: InlineKeyboard }
				) => any;
			}) => ctx.reply("Use the buttons!", { reply_markup: keyboardTime }),
		}
	);
	const time = responseTime.match;
	const walletAddress = await getWalletAddress(await privateKey());
	const user = new Wallet(
		1,
		selectScan(ChainCtx.toUpperCase()).rpc,
		privateKey(),
		walletAddress
	);
	ctx.reply(
		"Error 1INCHERROR: unable to call limit function, INTERNAL-JSON-RPC"
	);
	//user privatekey to send transaction
}
composer.command("limits", testComposer);
