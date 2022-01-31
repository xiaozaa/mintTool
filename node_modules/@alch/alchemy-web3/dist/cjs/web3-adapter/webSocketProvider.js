"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlchemyWebSocketProvider = void 0;
var tslib_1 = require("tslib");
var eventemitter3_1 = tslib_1.__importDefault(require("eventemitter3"));
var subscriptionBackfill_1 = require("../subscriptions/subscriptionBackfill");
var types_1 = require("../types");
var hex_1 = require("../util/hex");
var jsonRpc_1 = require("../util/jsonRpc");
var promises_1 = require("../util/promises");
var HEARTBEAT_INTERVAL = 30000;
var HEARTBEAT_WAIT_TIME = 10000;
var BACKFILL_TIMEOUT = 60000;
var BACKFILL_RETRIES = 5;
/**
 * Subscriptions have a memory of recent events they have sent so that in the
 * event that they disconnect and need to backfill, they can detect re-orgs.
 * Keep a buffer that goes back at least these many blocks, the maximum amount
 * at which we might conceivably see a re-org.
 *
 * Note that while our buffer goes back this many blocks, it may contain more
 * than this many elements, since in the case of logs subscriptions more than
 * one event may be emitted for a block.
 */
var RETAINED_EVENT_BLOCK_COUNT = 10;
var AlchemyWebSocketProvider = /** @class */ (function (_super) {
    tslib_1.__extends(AlchemyWebSocketProvider, _super);
    function AlchemyWebSocketProvider(ws, sendJsonRpcPayload, jsonRpcSenders) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.sendJsonRpcPayload = sendJsonRpcPayload;
        _this.jsonRpcSenders = jsonRpcSenders;
        // In the case of a WebSocket reconnection, all subscriptions are lost and we
        // create new ones to replace them, but we want to create the illusion that
        // the original subscriptions persist. Thus, maintain a mapping from the
        // "virtual" subscription ids which are visible to the consumer to the
        // "physical" subscription ids of the actual connections. This terminology is
        // borrowed from virtual and physical memory, which has a similar mapping.
        _this.virtualSubscriptionsById = new Map();
        _this.virtualIdsByPhysicalId = new Map();
        _this.cancelBackfill = noop;
        _this.startHeartbeat = function () {
            if (_this.heartbeatIntervalId != null) {
                return;
            }
            _this.heartbeatIntervalId = setInterval(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, promises_1.withTimeout(this.jsonRpcSenders.send("net_version"), HEARTBEAT_WAIT_TIME)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = _b.sent();
                            this.ws.reconnect();
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, HEARTBEAT_INTERVAL);
        };
        _this.stopHeartbeatAndBackfill = function () {
            if (_this.heartbeatIntervalId != null) {
                clearInterval(_this.heartbeatIntervalId);
                _this.heartbeatIntervalId = undefined;
            }
            _this.cancelBackfill();
        };
        _this.handleMessage = function (event) {
            var message = JSON.parse(event.data);
            if (!types_1.isSubscriptionEvent(message)) {
                return;
            }
            var physicalId = message.params.subscription;
            var virtualId = _this.virtualIdsByPhysicalId.get(physicalId);
            if (!virtualId) {
                return;
            }
            var subscription = _this.virtualSubscriptionsById.get(virtualId);
            if (subscription.method !== "eth_subscribe") {
                _this.emitGenericEvent(virtualId, message.params.result);
                return;
            }
            switch (subscription.params[0]) {
                case "newHeads": {
                    var newHeadsSubscription = subscription;
                    var newHeadsMessage = message;
                    var isBackfilling = newHeadsSubscription.isBackfilling, backfillBuffer = newHeadsSubscription.backfillBuffer;
                    var result = newHeadsMessage.params.result;
                    if (isBackfilling) {
                        addToNewHeadsEventsBuffer(backfillBuffer, result);
                    }
                    else {
                        _this.emitNewHeadsEvent(virtualId, result);
                    }
                    break;
                }
                case "logs": {
                    var logsSubscription = subscription;
                    var logsMessage = message;
                    var isBackfilling = logsSubscription.isBackfilling, backfillBuffer = logsSubscription.backfillBuffer;
                    var result = logsMessage.params.result;
                    if (isBackfilling) {
                        addToLogsEventsBuffer(backfillBuffer, result);
                    }
                    else {
                        _this.emitLogsEvent(virtualId, result);
                    }
                    break;
                }
                default:
                    _this.emitGenericEvent(virtualId, message.params.result);
            }
        };
        _this.handleReopen = function () {
            var e_1, _a;
            _this.virtualIdsByPhysicalId.clear();
            var _b = promises_1.makeCancelToken(), cancel = _b.cancel, isCancelled = _b.isCancelled;
            _this.cancelBackfill = cancel;
            var _loop_1 = function (subscription) {
                (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var error_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, this.resubscribeAndBackfill(isCancelled, subscription)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                if (!isCancelled()) {
                                    console.error("Error while backfilling \"" + subscription.params[0] + "\" subscription. Some events may be missing.", error_1);
                                }
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })();
            };
            try {
                for (var _c = tslib_1.__values(_this.virtualSubscriptionsById.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var subscription = _d.value;
                    _loop_1(subscription);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this.startHeartbeat();
        };
        _this.backfiller = subscriptionBackfill_1.makeBackfiller(jsonRpcSenders);
        _this.addSocketListeners();
        _this.startHeartbeat();
        return _this;
    }
    AlchemyWebSocketProvider.prototype.send = function (request, callback) {
        if (isSubscribeRequest(request)) {
            var id = request.id;
            if (id === undefined) {
                // The JSON-RPC spec says to return nothing if there is no request id.
                return;
            }
            promises_1.callWhenDone(this.subscribe(request), callback);
            return;
        }
        if (isUnsubscribeRequest(request)) {
            promises_1.callWhenDone(this.unsubscribe(request), callback);
            return;
        }
        promises_1.callWhenDone(this.sendJsonRpcPayload(request), callback);
    };
    AlchemyWebSocketProvider.prototype.supportsSubscriptions = function () {
        return true;
    };
    AlchemyWebSocketProvider.prototype.disconnect = function (code, reason) {
        this.removeSocketListeners();
        this.removeAllListeners();
        this.stopHeartbeatAndBackfill();
        this.ws.close(code, reason);
    };
    AlchemyWebSocketProvider.prototype.connect = function () {
        // No-op. We're already connected when passed a websocket in the
        // constructor.
    };
    AlchemyWebSocketProvider.prototype.reset = function () {
        // No-op.
    };
    AlchemyWebSocketProvider.prototype.reconnect = function () {
        // No-op. This isn't called anywhere.
    };
    AlchemyWebSocketProvider.prototype.subscribe = function (request) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var method, _a, params, startingBlockNumber, response, id;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        method = request.method, _a = request.params, params = _a === void 0 ? [] : _a;
                        return [4 /*yield*/, this.getBlockNumber()];
                    case 1:
                        startingBlockNumber = _b.sent();
                        return [4 /*yield*/, this.sendJsonRpcPayload(request)];
                    case 2:
                        response = _b.sent();
                        id = response.result;
                        this.virtualSubscriptionsById.set(id, {
                            method: method,
                            params: params,
                            startingBlockNumber: startingBlockNumber,
                            virtualId: id,
                            physicalId: id,
                            sentEvents: [],
                            isBackfilling: false,
                            backfillBuffer: [],
                        });
                        this.virtualIdsByPhysicalId.set(id, id);
                        return [2 /*return*/, jsonRpc_1.makeResponse(request.id, id)];
                }
            });
        });
    };
    AlchemyWebSocketProvider.prototype.unsubscribe = function (request) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var subscriptionId, virtualSubscription, physicalId, physicalRequest;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        subscriptionId = (_a = request.params) === null || _a === void 0 ? void 0 : _a[0];
                        virtualSubscription = this.virtualSubscriptionsById.get(subscriptionId);
                        if (!virtualSubscription) {
                            return [2 /*return*/, jsonRpc_1.makeResponse(request.id, false)];
                        }
                        physicalId = virtualSubscription.physicalId;
                        physicalRequest = tslib_1.__assign(tslib_1.__assign({}, request), { params: [physicalId] });
                        return [4 /*yield*/, this.sendJsonRpcPayload(physicalRequest)];
                    case 1:
                        _b.sent();
                        this.virtualSubscriptionsById.delete(subscriptionId);
                        this.virtualIdsByPhysicalId.delete(physicalId);
                        return [2 /*return*/, jsonRpc_1.makeResponse(request.id, true)];
                }
            });
        });
    };
    AlchemyWebSocketProvider.prototype.addSocketListeners = function () {
        this.ws.addEventListener("message", this.handleMessage);
        this.ws.addEventListener("reopen", this.handleReopen);
        this.ws.addEventListener("down", this.stopHeartbeatAndBackfill);
    };
    AlchemyWebSocketProvider.prototype.removeSocketListeners = function () {
        this.ws.removeEventListener("message", this.handleMessage);
        this.ws.removeEventListener("reopen", this.handleReopen);
        this.ws.removeEventListener("down", this.stopHeartbeatAndBackfill);
    };
    AlchemyWebSocketProvider.prototype.resubscribeAndBackfill = function (isCancelled, subscription) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var virtualId, method, params, sentEvents, backfillBuffer, startingBlockNumber, physicalId, _a, backfillEvents, events, filter_1, backfillEvents, events;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        virtualId = subscription.virtualId, method = subscription.method, params = subscription.params, sentEvents = subscription.sentEvents, backfillBuffer = subscription.backfillBuffer, startingBlockNumber = subscription.startingBlockNumber;
                        subscription.isBackfilling = true;
                        backfillBuffer.length = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 9, 10]);
                        return [4 /*yield*/, this.jsonRpcSenders.send(method, params)];
                    case 2:
                        physicalId = _b.sent();
                        promises_1.throwIfCancelled(isCancelled);
                        subscription.physicalId = physicalId;
                        this.virtualIdsByPhysicalId.set(physicalId, virtualId);
                        _a = params[0];
                        switch (_a) {
                            case "newHeads": return [3 /*break*/, 3];
                            case "logs": return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, promises_1.withBackoffRetries(function () {
                            return promises_1.withTimeout(_this.backfiller.getNewHeadsBackfill(isCancelled, sentEvents, startingBlockNumber), BACKFILL_TIMEOUT);
                        }, BACKFILL_RETRIES, function () { return !isCancelled(); })];
                    case 4:
                        backfillEvents = _b.sent();
                        promises_1.throwIfCancelled(isCancelled);
                        events = subscriptionBackfill_1.dedupeNewHeads(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(backfillEvents)), tslib_1.__read(backfillBuffer)));
                        events.forEach(function (event) { return _this.emitNewHeadsEvent(virtualId, event); });
                        return [3 /*break*/, 8];
                    case 5:
                        filter_1 = params[1] || {};
                        return [4 /*yield*/, promises_1.withBackoffRetries(function () {
                                return promises_1.withTimeout(_this.backfiller.getLogsBackfill(isCancelled, filter_1, sentEvents, startingBlockNumber), BACKFILL_TIMEOUT);
                            }, BACKFILL_RETRIES, function () { return !isCancelled(); })];
                    case 6:
                        backfillEvents = _b.sent();
                        promises_1.throwIfCancelled(isCancelled);
                        events = subscriptionBackfill_1.dedupeLogs(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(backfillEvents)), tslib_1.__read(backfillBuffer)));
                        events.forEach(function (event) { return _this.emitLogsEvent(virtualId, event); });
                        return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        subscription.isBackfilling = false;
                        backfillBuffer.length = 0;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    AlchemyWebSocketProvider.prototype.getBlockNumber = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blockNumberHex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.jsonRpcSenders.send("eth_blockNumber")];
                    case 1:
                        blockNumberHex = _a.sent();
                        return [2 /*return*/, hex_1.fromHex(blockNumberHex)];
                }
            });
        });
    };
    AlchemyWebSocketProvider.prototype.emitNewHeadsEvent = function (virtualId, result) {
        this.emitAndRememberEvent(virtualId, result, getNewHeadsBlockNumber);
    };
    AlchemyWebSocketProvider.prototype.emitLogsEvent = function (virtualId, result) {
        this.emitAndRememberEvent(virtualId, result, getLogsBlockNumber);
    };
    /**
     * Emits an event to consumers, but also remembers it in its subscriptions's
     * `sentEvents` buffer so that we can detect re-orgs if the connection drops
     * and needs to be reconnected.
     */
    AlchemyWebSocketProvider.prototype.emitAndRememberEvent = function (virtualId, result, getBlockNumber) {
        var subscription = this.virtualSubscriptionsById.get(virtualId);
        if (!subscription) {
            return;
        }
        // Web3 modifies these event objects once we pass them on (changing hex
        // numbers to numbers). We want the original event, so make a defensive
        // copy.
        addToPastEventsBuffer(subscription.sentEvents, tslib_1.__assign({}, result), getBlockNumber);
        this.emitGenericEvent(virtualId, result);
    };
    AlchemyWebSocketProvider.prototype.emitGenericEvent = function (virtualId, result) {
        var event = {
            jsonrpc: "2.0",
            method: "eth_subscription",
            params: {
                subscription: virtualId,
                result: result,
            },
        };
        this.emit("data", event);
    };
    return AlchemyWebSocketProvider;
}(eventemitter3_1.default));
exports.AlchemyWebSocketProvider = AlchemyWebSocketProvider;
function addToNewHeadsEventsBuffer(pastEvents, event) {
    addToPastEventsBuffer(pastEvents, event, getNewHeadsBlockNumber);
}
function addToLogsEventsBuffer(pastEvents, event) {
    addToPastEventsBuffer(pastEvents, event, getLogsBlockNumber);
}
/**
 * Adds a new event to an array of events, evicting any events which
 * are so old that they will no longer feasibly be part of a reorg.
 */
function addToPastEventsBuffer(pastEvents, event, getBlockNumber) {
    var currentBlockNumber = getBlockNumber(event);
    // Find first index of an event recent enough to retain, then drop everything
    // at a lower index.
    var firstGoodIndex = pastEvents.findIndex(function (e) { return getBlockNumber(e) > currentBlockNumber - RETAINED_EVENT_BLOCK_COUNT; });
    if (firstGoodIndex === -1) {
        pastEvents.length = 0;
    }
    else {
        pastEvents.splice(0, firstGoodIndex);
    }
    pastEvents.push(event);
}
function isSubscribeRequest(request) {
    return !Array.isArray(request) && request.method === "eth_subscribe";
}
function isUnsubscribeRequest(request) {
    return !Array.isArray(request) && request.method === "eth_unsubscribe";
}
function getNewHeadsBlockNumber(event) {
    return hex_1.fromHex(event.number);
}
function getLogsBlockNumber(event) {
    return hex_1.fromHex(event.blockNumber);
}
function noop() {
    // Nothing.
}
