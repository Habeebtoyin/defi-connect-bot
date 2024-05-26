const UNISWAP_ROUTER_ADDRESS = "";
const PCS_ROUTER_ADDRESS = "";

const ABI = [
	{
		constant: true,
		inputs: [{ name: "_owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", type: "uint256" }],
		payable: false,
		type: "function",
	},
	{
		constant: false,
		inputs: [
			{ name: "guy", type: "address" },
			{ name: "wad", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "approved", type: "bool" }],
		payable: false,
		type: "function",
	},
	{
		constant: true,
		inputs: [
			{ name: "sender", type: "address" },
			{ name: "guy", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "allowed", type: "uint256" }],
		payable: false,
		type: "function",
	},
	{
		constant: true,
		inputs: [],
		name: "symbol",
		outputs: [{ name: "outname", type: "string" }],
		payable: false,
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "recipient", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		constant: true,
		inputs: [{ name: "_owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", type: "uint256" }],
		payable: false,
		type: "function",
	},
	{
		constant: false,
		inputs: [
			{ name: "guy", type: "address" },
			{ name: "wad", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "approved", type: "bool" }],
		payable: false,
		type: "function",
	},
	{
		constant: true,
		inputs: [
			{ name: "sender", type: "address" },
			{ name: "guy", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "allowed", type: "uint256" }],
		payable: false,
		type: "function",
	},
	{
		constant: true,
		inputs: [],
		name: "symbol",
		outputs: [{ name: "outname", type: "string" }],
		payable: false,
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "recipient", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
];

const DEV_NET = "http://127.0.0.1:8545/";
// const ETH_RPC_URL =
// 	"https://eth-mainnet.nodereal.io/v1/07c15e247ea043459af03f3c0bc0c018";
const ETH_RPC_URL = "https://testnet-rpc.plumenetwork.xyz/http"
// "https://rpc-core.icecreamswap.com";
// const ETH_TESTNET = {
// 	rpc: ETH_RPC_URL,
// 	router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
// 	weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
// 	page: "https://etherscan.io",
// };
const ETH_TESTNET = {
	rpc: ETH_RPC_URL,
	// router: "0xBb5e1777A331ED93E07cF043363e48d320eb96c4",
	router: "0x9Af36aD30ecAc6ce8B6D1F3d6C42711c48Ab627f",
	// weth: "0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f",
	weth: "0xd9d6507119Ec56ce22A89bEdAcd6B44D495BFf08",
	// page: "https://scan.coredao.org",
	page: "https://plume-testnet.explorer.caldera.xyz/"
};
const BSC_TESTNET = {
	rpc: "https://bsc-dataseed.binance.org",
	router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
	weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
	page: "https://bscscan.com",


};


//Core Info

// RPC = https://rpc-core.icecreamswap.com
// chainID: 1116
// explorer: https://scan.coredao.org
// ICE contract: 0xc0E49f8C615d3d4c245970F6Dc528E4A47d69a44



const BSC_RPC_URL = "https://bsc.rpc.blxrbdn.com";

export {
	PCS_ROUTER_ADDRESS,
	ETH_RPC_URL,
	BSC_RPC_URL,
	UNISWAP_ROUTER_ADDRESS,
	ABI,
	BSC_TESTNET,
	ETH_TESTNET,
};
