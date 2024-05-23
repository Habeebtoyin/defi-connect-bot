import { createClient } from "@supabase/supabase-js";
import { GenerateWallet } from "./blockchain";
import axios from "axios";

// const supabaseUrl="https://tkjdpilcqvkmjkestlta.supabase.co";

// const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRramRwaWxjcXZrbWprZXN0bHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyOTQwNzcsImV4cCI6MjAyOTg3MDA3N30.d1NdcyCYHg75vEbNBvzWNpvQCSzAushoQ47Wdt3Ee6M";

const supabaseUrl="https://vaelwjgqigbxpdpzkggs.supabase.co";
const supabaseKey= 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZWx3amdxaWdieHBkcHprZ2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTI3MTAsImV4cCI6MjAzMTg2ODcxMH0.xKGlQbd71BAh4fH2XOSZ9bCNYsVRtc4jyxe11v1qFC8";
            

const supabase = createClient(supabaseUrl, supabaseKey);
export async function authUser(userId, ctx) {
	try {
		const supabase = createClient(supabaseUrl, supabaseKey);
		ctx.reply("Fetching data");
		let { data: userCoreBot, error }: any = await supabase
			// .from("botUsers")
			.from("userCoreBot")
			.select("*")
			.eq("userID", userId);
		if (userCoreBot.length < 1) {
			const pK1 = GenerateWallet();
			const pK2 = GenerateWallet();
			const pK3 = GenerateWallet();
			console.log(pK1);
			// ctx.reply("Registering......")
			try {
				const response = await axios.post(
					
					// "https://tkjdpilcqvkmjkestlta.supabase.co/rest/v1/botUsers",
					"https://vaelwjgqigbxpdpzkggs.supabase.co/rest/v1/userCoreBot",
					// '{ "some_column": "someValue", "other_column": "otherValue" }',
					{
						pK1,
						pK2,
						pK3,
						userID: userId,
					},
					{
						headers: {
							apikey: supabaseKey,
							Authorization: "Bearer " + supabaseKey,
							"Content-Type": "application/json",
							Prefer: "return=minimal",
						},
					}
				);
			} catch (error) {
				console.log(error);
			}

			let { data: userCoreBot, error }: any = await supabase
				.from("userCoreBot")
				.select("*")
				.eq("userID", userId);
			return userCoreBot[0];
			// console.log({ data, error });
		}
		if (userCoreBot.length > 0) {
			//  ctx.reply("Logging In ....")
			let { data: userCoreBot, error }: any = await supabase
				.from("userCoreBot")
				.select("*")
				.eq("userID", userId);
			return userCoreBot[0];
		}
	} catch (error) {}

	//fecth for user if exist
	// generate new wallet
}

export async function addToken(
	tokenAddress,
	walletAddress,
	chain,
	ctx,
	userID
) {
	try {
		const res = await axios.post(
			// "https://auswwgwgwrvdcalpueit.supabase.co/rest/v1/botUserTokens",
			"https://vaelwjgqigbxpdpzkggs.supabase.co/rest/v1/userCoreTokens",
			// '{ "some_column": "someValue", "other_column": "otherValue" }',
			{
				userID,
				tokenAddress,
				walletAddress,
				chain,
			},
			{
				headers: {
					apikey: supabaseKey,
					Authorization: "Bearer " + supabaseKey,
					"Content-Type": "application/json",
					Prefer: "return=minimal",
				},
			}
		);
		if (res) {
			// console.log(res)
			ctx.reply("Token Added Successfully");
		}
	} catch (error) {
		console.log(error);
		ctx.reply("Error While Adding token");
	}
}

export async function getUserTokenAndBalances(userID, wallet, chain) {
	//filter with params
	const supabase = createClient(supabaseUrl, supabaseKey);
	let { data: userCoreTokens, error } = await supabase
		.from("userCoreTokens")
		.select("*")
		.eq("userID", userID)
		.eq("walletAddress", wallet)
		.eq("chain", chain);
	//  console.log(botUserTokens, userID, wallet, chain)
	return userCoreTokens;
}
module.exports = {
	authUser,
	addToken,
	getUserTokenAndBalances,
};
