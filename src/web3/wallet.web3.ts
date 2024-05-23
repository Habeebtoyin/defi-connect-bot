import { ethers, Provider, Wallet } from "ethers";
import { ETH_RPC_URL } from "../config";

export class CreateWallet {
	// chainRPC = "https://eth-mainnet.g.alchemy.com/v2/tv58GkB34IkWVdSF4KDUgKXPATrILtP6";
      chainRPC= "https://rpc-core.icecreamswap.com"
	tokenABI = [
		// Standard ERC-20 functions
		"function balanceOf(address account) view returns (uint256)",
		"function transfer(address recipient, uint256 amount) returns (bool)",
		"function decimals() view returns (uint8)",
		"function _decimals() view returns (uint8)",
		"function symbol() view returns (string)",
		"function _symbol() view returns (string)",
		"function approve(address spender, uint256 amount) returns (bool)",
	];
	provider = new ethers.JsonRpcProvider(this.chainRPC);

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

	async tokenBalanceOf(account: string, tokenAddress: string) {
		const tokenContract = new ethers.Contract(
			tokenAddress,
			this.tokenABI,
			this.provider
		);
		const balance = await tokenContract.balanceOf(account);
		return balance;
	}
	async getDecimals(tokenAddress: string) {
		const tokenContract = new ethers.Contract(
			tokenAddress,
			this.tokenABI,
			this.provider
		);

		try {
			const decimal = await tokenContract.decimals();
			return decimal;
		} catch (error) {
			const decimal = await tokenContract._decimals();
			return decimal;
		}
	}
}

