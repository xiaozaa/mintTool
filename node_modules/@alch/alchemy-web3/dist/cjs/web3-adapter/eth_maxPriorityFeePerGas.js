"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchEthMaxPriorityFeePerGasMethod = void 0;
function patchEthMaxPriorityFeePerGasMethod(web3) {
    web3.eth.customRPC({
        name: "getMaxPriorityFeePerGas",
        call: "eth_maxPriorityFeePerGas",
        params: 0,
    });
}
exports.patchEthMaxPriorityFeePerGasMethod = patchEthMaxPriorityFeePerGasMethod;
