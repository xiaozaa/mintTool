"use strict";
// The JSON-RPC types in Web3 definitions aren't quite right. Use these instead.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscriptionEvent = exports.isResponse = void 0;
function isResponse(message) {
    return (Array.isArray(message) ||
        (message.jsonrpc === "2.0" && message.id !== undefined));
}
exports.isResponse = isResponse;
function isSubscriptionEvent(message) {
    return !isResponse(message);
}
exports.isSubscriptionEvent = isSubscriptionEvent;
