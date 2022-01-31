// The JSON-RPC types in Web3 definitions aren't quite right. Use these instead.
export function isResponse(message) {
    return (Array.isArray(message) ||
        (message.jsonrpc === "2.0" && message.id !== undefined));
}
export function isSubscriptionEvent(message) {
    return !isResponse(message);
}
//# sourceMappingURL=types.js.map