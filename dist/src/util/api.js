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
exports.getUserTokenAndBalances = exports.addToken = exports.authUser = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const blockchain_1 = require("./blockchain");
const axios_1 = require("axios");
const supabaseUrl = "https://auswwgwgwrvdcalpueit.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3d3Z3dnd3J2ZGNhbHB1ZWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg1ODExNDksImV4cCI6MjAwNDE1NzE0OX0.hUN5bxHBK4aJXGBTI5lWFb-oIAWoCnBfcXbljb5vM8Y";
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function authUser(userId, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            ctx.reply("Fetching data");
            let { data: botUsers, error } = yield supabase
                .from("botUsers")
                .select("*")
                .eq("userID", userId);
            if (botUsers.length < 1) {
                const pK1 = (0, blockchain_1.GenerateWallet)();
                const pK2 = (0, blockchain_1.GenerateWallet)();
                const pK3 = (0, blockchain_1.GenerateWallet)();
                console.log(pK1);
                // ctx.reply("Registering......")
                try {
                    const response = yield axios_1.default.post("https://auswwgwgwrvdcalpueit.supabase.co/rest/v1/botUsers", 
                    // '{ "some_column": "someValue", "other_column": "otherValue" }',
                    {
                        pK1,
                        pK2,
                        pK3,
                        userID: userId,
                    }, {
                        headers: {
                            apikey: supabaseKey,
                            Authorization: "Bearer " + supabaseKey,
                            "Content-Type": "application/json",
                            Prefer: "return=minimal",
                        },
                    });
                }
                catch (error) {
                    console.log(error);
                }
                let { data: botUsers, error } = yield supabase
                    .from("botUsers")
                    .select("*")
                    .eq("userID", userId);
                return botUsers[0];
                // console.log({ data, error });
            }
            if (botUsers.length > 0) {
                //  ctx.reply("Logging In ....")
                let { data: botUsers, error } = yield supabase
                    .from("botUsers")
                    .select("*")
                    .eq("userID", userId);
                return botUsers[0];
            }
        }
        catch (error) { }
        //fecth for user if exist
        // generate new wallet
    });
}
exports.authUser = authUser;
function addToken(tokenAddress, walletAddress, chain, ctx, userID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.post("https://auswwgwgwrvdcalpueit.supabase.co/rest/v1/botUserTokens", 
            // '{ "some_column": "someValue", "other_column": "otherValue" }',
            {
                userID,
                tokenAddress,
                walletAddress,
                chain,
            }, {
                headers: {
                    apikey: supabaseKey,
                    Authorization: "Bearer " + supabaseKey,
                    "Content-Type": "application/json",
                    Prefer: "return=minimal",
                },
            });
            if (res) {
                // console.log(res)
                ctx.reply("Token Added Successfully");
            }
        }
        catch (error) {
            console.log(error);
            ctx.reply("Error While Adding token");
        }
    });
}
exports.addToken = addToken;
function getUserTokenAndBalances(userID, wallet, chain, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        //filter with params
        const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        let { data: botUserTokens, error } = yield supabase
            .from("botUserTokens")
            .select("*")
            .eq("userID", userID)
            .eq("walletAddress", wallet)
            .eq("chain", chain);
        //  console.log(botUserTokens, userID, wallet, chain)
        return botUserTokens;
    });
}
exports.getUserTokenAndBalances = getUserTokenAndBalances;
module.exports = {
    authUser,
    addToken,
    getUserTokenAndBalances,
};
