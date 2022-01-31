export function toHex(n) {
    return "0x" + n.toString(16);
}
export function fromHex(hexString) {
    return Number.parseInt(hexString, 16);
}
export function formatBlock(block) {
    if (typeof block === "string") {
        return block;
    }
    else if (typeof block === "number" && Number.isInteger(block)) {
        return toHex(block);
    }
    return block.toString();
}
//# sourceMappingURL=hex.js.map