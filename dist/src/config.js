"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH_TESTNET = exports.BSC_TESTNET = exports.ABI = exports.UNISWAP_ROUTER_ADDRESS = exports.BSC_RPC_URL = exports.ETH_RPC_URL = exports.PCS_ROUTER_ADDRESS = void 0;
const UNISWAP_ROUTER_ADDRESS = "";
exports.UNISWAP_ROUTER_ADDRESS = UNISWAP_ROUTER_ADDRESS;
const PCS_ROUTER_ADDRESS = "";
exports.PCS_ROUTER_ADDRESS = PCS_ROUTER_ADDRESS;
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
exports.ABI = ABI;
const DEV_NET = "http://127.0.0.1:8545/";
const ETH_RPC_URL = "https://eth-mainnet.nodereal.io/v1/07c15e247ea043459af03f3c0bc0c018";
exports.ETH_RPC_URL = ETH_RPC_URL;
const ETH_TESTNET = {
    rpc: ETH_RPC_URL,
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    page: "https://etherscan.io",
};
exports.ETH_TESTNET = ETH_TESTNET;
const BSC_TESTNET = {
    rpc: "https://bsc-dataseed.binance.org",
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    page: "https://bscscan.com",
};
exports.BSC_TESTNET = BSC_TESTNET;
const BSC_RPC_URL = "https://bsc.rpc.blxrbdn.com";
exports.BSC_RPC_URL = BSC_RPC_URL;
