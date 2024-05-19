//send token
//buy token from uniswap
//buy token  from pancakeswap
import { ethers } from "ethers";
export function GenerateWallet() {
	const mnemonic = ethers.Wallet.createRandom().privateKey;
	return mnemonic;
}

export async function getWalletAddress(privateKey: string | ethers.SigningKey) {
	const PubKey = new ethers.Wallet(privateKey).address;
	return PubKey;
}

export async function getGasPrice(
	rpcUrl: string | ethers.FetchRequest | undefined
) {
	const provider = new ethers.JsonRpcProvider(rpcUrl);
	const gasPrice: any = (await provider.getFeeData()).gasPrice;
	//  console.log("Current gas price:", gasPrice.toString());
	return gasPrice.toString();
}
export class Wallet {
	chainId: any;
	provider: any;
	privateKey: string | ethers.SigningKey;
	walletAddress: any | ethers.Overrides;
	tokenABI = [
		// Standard ERC-20 functions
		"function balanceOf(address account) view returns (uint256)",
		"function transfer(address recipient, uint256 amount) returns (bool)",
		"function decimals() view returns (uint8)",
		"function _decimals() view returns (uint8)",
		"function symbol() view returns (string)",
		"function _symbol() view returns (string)",
	];
	walletInstance: any;

	constructor(
		chainId: any,
		chainRPC: string | ethers.FetchRequest | undefined,
		privateKey: any,
		walletAddress: any
	) {
		this.chainId = chainId;
		this.provider = new ethers.JsonRpcProvider(chainRPC);
		this.privateKey = privateKey;
		this.walletAddress = walletAddress;
		this.walletInstance = new ethers.Wallet(this.privateKey, this.provider);
	}

	async checkEthBalance() {
		const balance = await this.provider.getBalance(this.walletAddress);

		// Convert the balance to Ether
		const etherBalance = ethers.formatEther(balance);

		return etherBalance;
	}
	async checkErc20Balance(contractAddress: string) {
		// Create a new instance of the ERC-20 token contract
		const tokenContract = new ethers.Contract(
			contractAddress,
			this.tokenABI,
			this.provider
		);
		const balance = await tokenContract.balanceOf(this.walletAddress);
		return balance;
		// Call the balanceOf function on the token contract to get the balance
	}
	async getSymbol(contractAddress: string) {
		const tokenContract = new ethers.Contract(
			contractAddress,
			this.tokenABI,
			this.provider
		);

		try {
			const symbol = await tokenContract.symbol();
			return symbol;
		} catch (err) {
			try {
				const symbol = await tokenContract._symbol();
				return symbol;
			} catch (error) {
				console.log(error);
			}
		}
	}
	async sendEth(to: any, amount: string) {
		const recipientAddress = to;
		const amountToSend = ethers.parseEther(amount);
		const transaction = {
			to: recipientAddress,
			value: amountToSend,
		};
		console.log(amountToSend, recipientAddress);
		const response = await this.walletInstance.sendTransaction(transaction);
		return response;
	}
	async getDecimals(tokenAddress: string) {
		const tokenContract = new ethers.Contract(
			tokenAddress,
			this.tokenABI,
			this.walletInstance
		);

		try {
			const decimal = await tokenContract.decimals();
			return decimal;
		} catch (error) {
			const decimal = await tokenContract._decimals();
			return decimal;
		}
	}

	async sendErc20Token(
		to: any | ethers.Overrides,
		amount: string,
		tokenAdd: string
	) {
		const tokenContract = new ethers.Contract(
			tokenAdd,
			this.tokenABI,
			this.walletInstance
		);
		// const decimal = await tokenContract.decimals()
		const tx = await tokenContract.transfer(to, ethers.parseEther(amount));
		return await tx.wait();
	}
	async sendTransaction(tx: any) {
		const transaction = await this.walletInstance.sendTransaction(tx);
		return transaction;
	}
}

module.exports = {
	Wallet,
	getGasPrice,
	GenerateWallet,
	getWalletAddress,
};
