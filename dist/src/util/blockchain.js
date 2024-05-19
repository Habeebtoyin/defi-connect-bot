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
exports.Wallet = exports.getGasPrice = exports.getWalletAddress = exports.GenerateWallet = void 0;
//send token
//buy token from uniswap
//buy token  from pancakeswap
const ethers_1 = require("ethers");
function GenerateWallet() {
    const mnemonic = ethers_1.ethers.Wallet.createRandom().privateKey;
    return mnemonic;
}
exports.GenerateWallet = GenerateWallet;
function getWalletAddress(privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const PubKey = new ethers_1.ethers.Wallet(privateKey).address;
        return PubKey;
    });
}
exports.getWalletAddress = getWalletAddress;
function getGasPrice(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const gasPrice = (yield provider.getFeeData()).gasPrice;
        //  console.log("Current gas price:", gasPrice.toString());
        return gasPrice.toString();
    });
}
exports.getGasPrice = getGasPrice;
class Wallet {
    constructor(chainId, chainRPC, privateKey, walletAddress) {
        this.tokenABI = [
            // Standard ERC-20 functions
            "function balanceOf(address account) view returns (uint256)",
            "function transfer(address recipient, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function _decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function _symbol() view returns (string)",
        ];
        this.chainId = chainId;
        this.provider = new ethers_1.ethers.JsonRpcProvider(chainRPC);
        this.privateKey = privateKey;
        this.walletAddress = walletAddress;
        this.walletInstance = new ethers_1.ethers.Wallet(this.privateKey, this.provider);
    }
    checkEthBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.provider.getBalance(this.walletAddress);
            // Convert the balance to Ether
            const etherBalance = ethers_1.ethers.formatEther(balance);
            return etherBalance;
        });
    }
    checkErc20Balance(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new instance of the ERC-20 token contract
            const tokenContract = new ethers_1.ethers.Contract(contractAddress, this.tokenABI, this.provider);
            const balance = yield tokenContract.balanceOf(this.walletAddress);
            return balance;
            // Call the balanceOf function on the token contract to get the balance
        });
    }
    getSymbol(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenContract = new ethers_1.ethers.Contract(contractAddress, this.tokenABI, this.provider);
            try {
                const symbol = yield tokenContract.symbol();
                return symbol;
            }
            catch (err) {
                try {
                    const symbol = yield tokenContract._symbol();
                    return symbol;
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    }
    sendEth(to, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipientAddress = to;
            const amountToSend = ethers_1.ethers.parseEther(amount);
            const transaction = {
                to: recipientAddress,
                value: amountToSend,
            };
            console.log(amountToSend, recipientAddress);
            const response = yield this.walletInstance.sendTransaction(transaction);
            return response;
        });
    }
    getDecimals(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenContract = new ethers_1.ethers.Contract(tokenAddress, this.tokenABI, this.walletInstance);
            try {
                const decimal = yield tokenContract.decimals();
                return decimal;
            }
            catch (error) {
                const decimal = yield tokenContract._decimals();
                return decimal;
            }
        });
    }
    sendErc20Token(to, amount, tokenAdd) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenContract = new ethers_1.ethers.Contract(tokenAdd, this.tokenABI, this.walletInstance);
            // const decimal = await tokenContract.decimals()
            const tx = yield tokenContract.transfer(to, ethers_1.ethers.parseEther(amount));
            return yield tx.wait();
        });
    }
    sendTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.walletInstance.sendTransaction(tx);
            return transaction;
        });
    }
}
exports.Wallet = Wallet;
module.exports = {
    Wallet,
    getGasPrice,
    GenerateWallet,
    getWalletAddress,
};
