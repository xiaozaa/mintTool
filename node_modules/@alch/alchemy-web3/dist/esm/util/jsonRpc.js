import { __awaiter, __generator } from "tslib";
export function makeJsonRpcPayloadFactory() {
    var nextId = 0;
    return function (method, params) { return ({
        method: method,
        params: params,
        jsonrpc: "2.0",
        id: "alc-web3:" + nextId++,
    }); };
}
export function makeJsonRpcSenders(sendJsonRpcPayload, makeJsonRpcPayload) {
    var _this = this;
    var send = function (method, params) { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sendJsonRpcPayload(makeJsonRpcPayload(method, params))];
                case 1:
                    response = _a.sent();
                    if (response.error) {
                        throw new Error(response.error.message);
                    }
                    return [2 /*return*/, response.result];
            }
        });
    }); };
    function sendBatch(parts) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, response, message, errorResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = parts.map(function (_a) {
                            var method = _a.method, params = _a.params;
                            return makeJsonRpcPayload(method, params);
                        });
                        return [4 /*yield*/, sendJsonRpcPayload(payload)];
                    case 1:
                        response = _a.sent();
                        if (!Array.isArray(response)) {
                            message = response.error
                                ? response.error.message
                                : "Batch request failed";
                            throw new Error(message);
                        }
                        errorResponse = response.find(function (r) { return !!r.error; });
                        if (errorResponse) {
                            throw new Error(errorResponse.error.message);
                        }
                        // The ids are ascending numbers because that's what Payload Factories do.
                        return [2 /*return*/, response
                                .sort(function (r1, r2) { return r1.id - r2.id; })
                                .map(function (r) { return r.result; })];
                }
            });
        });
    }
    return { send: send, sendBatch: sendBatch };
}
export function makeResponse(id, result) {
    return { jsonrpc: "2.0", id: id, result: result };
}
//# sourceMappingURL=jsonRpc.js.map