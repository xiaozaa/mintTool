export function patchEthMaxPriorityFeePerGasMethod(web3) {
    web3.eth.customRPC({
        name: "getMaxPriorityFeePerGas",
        call: "eth_maxPriorityFeePerGas",
        params: 0,
    });
}
//# sourceMappingURL=eth_maxPriorityFeePerGas.js.map