"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBlock = exports.fromHex = exports.toHex = void 0;
function toHex(n) {
    return "0x" + n.toString(16);
}
exports.toHex = toHex;
function fromHex(hexString) {
    return Number.parseInt(hexString, 16);
}
exports.fromHex = fromHex;
function formatBlock(block) {
    if (typeof block === "string") {
        return block;
    }
    else if (typeof block === "number" && Number.isInteger(block)) {
        return toHex(block);
    }
    return block.toString();
}
exports.formatBlock = formatBlock;
