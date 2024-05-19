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
exports.sellToken = exports.buyToken = void 0;
const ethers_1 = require("ethers");
function buyToken(BNB, to_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK, ctx, scan) {
    return __awaiter(this, void 0, void 0, function* () {
        //   console.log(BNB, to_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK, ctx, scan)
        const tokenIn = BNB;
        const tokenOut = to_PURCHASE;
        let provider = new ethers_1.ethers.JsonRpcProvider(rpc);
        const account = new ethers_1.ethers.Wallet(pK).connect(provider);
        const router = new ethers_1.ethers.Contract(routerAddress, [
            "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
            "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)",
            "function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        ], account);
        try {
            //We buy x amount of the new token for our bnb
            const amountIn = ethers_1.ethers.parseUnits(`${AMOUNT_OF_BNB}`, "ether");
            let amountOutMin;
            const amounts = yield router.getAmountsOut(amountIn, [
                tokenIn,
                tokenOut,
            ]);
            if (parseInt(Slippage) !== 0) {
                //Our execution price will be a bit different, we need some flexibility
                amountOutMin =
                    BigInt(amounts[1]) - BigInt(amounts[1]) / BigInt(Slippage);
            }
            const tx = yield router.swapExactETHForTokens(
            //uncomment here if you want to buy token
            amountOutMin, [tokenIn, tokenOut], recipient, Date.now() + 1000 * 60 * 5, //5 minutes
            {
                //'gasLimit': 1671500610,
                //'gasPrice': 1671500610,
                //'nonce': null, //set you want buy at where position in blocks
                value: amountIn,
            });
            const receipt = yield tx.wait();
            console.log(receipt);
            ctx.reply(`Transaction receipt : ${scan}/tx/${receipt.logs[1].transactionHash}`);
            //  console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);
        }
        catch (err) {
            // console.log(BNB, to_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK,)
            console.log({ err });
            let error = JSON.parse(JSON.stringify(err));
            if (error.reason) {
                console.log(`Error caused by : 
            {
            reason : ${error.reason},
            transactionHash : ${error.transactionHash}
            message : ${error}
            }`);
                ctx.reply(`Error caused by : 
                {
                reason : ${error.reason},
                message : ${error.message}
                }`);
            }
            if (error.code) {
                ctx.reply(`Error caused by : 
            {
            reason : ${error.code},
            }`);
            }
            console.log({ error });
        }
    });
}
exports.buyToken = buyToken;
function approve(operator, approverPk, rpc, tokenAddress, ctx, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const abi = [
                "function approve(address spender, uint256 amount) returns (bool)",
            ];
            let provider = new ethers_1.ethers.JsonRpcProvider(rpc);
            const max = ethers_1.ethers.MaxUint256;
            const account = new ethers_1.ethers.Wallet(approverPk).connect(provider);
            const contract = new ethers_1.ethers.Contract(tokenAddress, abi, account);
            const tx = yield contract.approve(operator, max);
            // await contract.approve(operator, "1000000000000000000000000")
            const receipt = yield tx.wait();
            //console.log("approved gone")
            ctx.reply("Router Contract Approved");
        }
        catch (error) {
            console.log(error);
            ctx.reply(" Error while Appoving Router Contract");
        }
    });
}
function sellToken(BNB, from_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK, ctx, scan) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(BNB, from_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK, ctx, scan);
        const tokenIn = from_PURCHASE;
        const tokenOut = BNB;
        let provider = new ethers_1.ethers.JsonRpcProvider(rpc);
        const account = new ethers_1.ethers.Wallet(pK).connect(provider);
        const router = new ethers_1.ethers.Contract(routerAddress, [
            "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
            "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)",
            "function swapExactETHForTokens( uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
            "function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
        ], account);
        const amountInMax = ethers_1.ethers.parseUnits(AMOUNT_OF_BNB.toString(), 18);
        yield approve(routerAddress, pK, rpc, from_PURCHASE, ctx, amountInMax);
        //  await approve(routerAddress, pK, rpc, tokenOut, ctx)
        // console.log("here 1")
        let amountOut;
        const amounts = yield router.getAmountsOut(amountInMax, [
            tokenIn,
            tokenOut,
        ]);
        if (parseInt(Slippage) !== 0) {
            //Our execution price will be a bit different, we need some flexibility
            amountOut = BigInt(amounts[1]) - BigInt(amounts[1]) / BigInt(Slippage);
        }
        const tx = yield router
            .swapTokensForExactETH(
        //uncomment here if you want to buy token
        amountOut, amountInMax, [tokenIn, tokenOut], recipient, Date.now() + 1000 * 60 * 5)
            .then((res) => {
            //  console.log(res)
            ctx.reply("Sell Successful ");
            ctx.reply(`Transaction receipt : ${scan}/tx/${res.logs[1].transactionHash}`);
            return res;
        })
            .catch((err) => {
            console.log({ err });
            let error = JSON.parse(JSON.stringify(err));
            if (error.reason) {
                console.log(`Error caused by : 
            {
            reason : ${error.reason},
            transactionHash : ${error.transactionHash}
            message : ${error}
            }`);
                ctx.reply(`Error caused by : 
                {
                reason : ${error.reason},
                message : ${error.message}
                }`);
            }
            if (error.code) {
                ctx.reply(`Error caused by : 
            {
            code : ${error.code},
            message : ${error.info.error.message},
            }`);
            }
            console.log({ error });
        });
    });
}
exports.sellToken = sellToken;
module.exports = { buyToken, sellToken };
