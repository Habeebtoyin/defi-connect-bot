const { buyToken, sellToken } = require("./src/util/trade")

let BNB, to_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK;

BNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
to_PURCHASE = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
AMOUNT_OF_BNB = 1
routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
recipient = "0x9BE44fc804aB8A6027E245c38e1f5c6476e967C3"
gasPrice = 15000000000
Slippage = 1
Slippage = 200000
rpc = "HTTP://127.0.0.1:8545"
pK = "0xa2576c6fea36efcc9bacf17b4a23049f5bc2cb8043724765ac36eb0c2ae4d1ca"
async function main() {
    await sellToken(BNB, to_PURCHASE, AMOUNT_OF_BNB, routerAddress, recipient, gasPrice, Slippage, rpc, pK)
}

main()