import { callWhenDone } from "../util/promises";
/**
 * Returns a "provider" which can be passed to the Web3 constructor.
 */
export function makeAlchemyHttpProvider(sendJsonRpcPayload) {
    function send(payload, callback) {
        callWhenDone(sendJsonRpcPayload(payload), callback);
    }
    return { send: send };
}
//# sourceMappingURL=httpProvider.js.map