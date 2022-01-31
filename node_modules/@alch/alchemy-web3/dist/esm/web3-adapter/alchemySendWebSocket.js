import { __read, __spreadArray, __values } from "tslib";
import { isResponse, } from "../types";
export function makeWebSocketSender(ws) {
    var contextsById = new Map();
    ws.addEventListener("message", function (message) {
        var response = JSON.parse(message.data);
        if (!isResponse(response)) {
            return;
        }
        var id = getIdFromResponse(response);
        if (id === undefined) {
            return;
        }
        var context = contextsById.get(id);
        if (!context) {
            return;
        }
        var resolve = context.resolve;
        contextsById.delete(id);
        if (!Array.isArray(response) &&
            response.error &&
            response.error.code === 429) {
            resolve({ type: "rateLimit" });
        }
        else {
            resolve({ response: response, type: "jsonrpc" });
        }
    });
    ws.addEventListener("down", function () {
        __spreadArray([], __read(contextsById)).forEach(function (_a) {
            var _b = __read(_a, 2), id = _b[0], _c = _b[1], request = _c.request, resolve = _c.resolve;
            if (isWrite(request)) {
                // Writes cannot be resent because they will fail for a duplicate nonce.
                contextsById.delete(id);
                resolve({
                    type: "networkError",
                    status: 0,
                    message: "WebSocket closed before receiving a response for write request with id: " + id + ".",
                });
            }
        });
    });
    ws.addEventListener("reopen", function () {
        var e_1, _a;
        try {
            for (var _b = __values(contextsById.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var request = _c.value.request;
                ws.send(JSON.stringify(request));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
    return function (request) {
        return new Promise(function (resolve) {
            var id = getIdFromRequest(request);
            if (id !== undefined) {
                var existingContext = contextsById.get(id);
                if (existingContext) {
                    var message = "Another WebSocket request was made with the same id (" + id + ") before a response was received.";
                    console.error(message);
                    existingContext.resolve({
                        message: message,
                        type: "networkError",
                        status: 0,
                    });
                }
                contextsById.set(id, { request: request, resolve: resolve });
            }
            ws.send(JSON.stringify(request));
        });
    };
}
function getIdFromRequest(request) {
    if (!Array.isArray(request)) {
        return request.id;
    }
    return getCanonicalIdFromList(request.map(function (p) { return p.id; }));
}
function getIdFromResponse(response) {
    if (!Array.isArray(response)) {
        return response.id;
    }
    return getCanonicalIdFromList(response.map(function (p) { return p.id; }));
}
/**
 * Since the JSON-RPC spec allows responses to be returned in a different order
 * than sent, we need a mechanism for choosing a canonical id from a list that
 * doesn't depend on the order. This chooses the "minimum" id by an arbitrary
 * ordering: the smallest string if possible, otherwise the smallest number,
 * otherwise null.
 */
function getCanonicalIdFromList(ids) {
    var stringIds = ids.filter(function (id) { return typeof id === "string"; });
    if (stringIds.length > 0) {
        return stringIds.reduce(function (bestId, id) { return (bestId < id ? bestId : id); });
    }
    var numberIds = ids.filter(function (id) { return typeof id === "number"; });
    if (numberIds.length > 0) {
        return Math.min.apply(Math, __spreadArray([], __read(numberIds)));
    }
    return ids.indexOf(null) >= 0 ? null : undefined;
}
function isWrite(request) {
    return Array.isArray(request)
        ? request.every(isSingleWrite)
        : isSingleWrite(request);
}
var WRITE_METHODS = ["eth_sendTransaction", "eth_sendRawTransaction"];
function isSingleWrite(request) {
    return WRITE_METHODS.includes(request.method);
}
//# sourceMappingURL=alchemySendWebSocket.js.map