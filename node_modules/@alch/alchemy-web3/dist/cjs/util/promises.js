"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELLED = exports.throwIfCancelled = exports.makeCancelToken = exports.withBackoffRetries = exports.withTimeout = exports.delay = exports.callWhenDone = exports.promisify = void 0;
var tslib_1 = require("tslib");
/**
 * Helper for converting functions which take a callback as their final argument
 * to functions which return a promise.
 */
function promisify(f) {
    return new Promise(function (resolve, reject) {
        return f(function (error, result) {
            if (error != null) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
}
exports.promisify = promisify;
/**
 * Helper for converting functions which return a promise to functions which
 * take a callback as their final argument.
 */
function callWhenDone(promise, callback) {
    promise.then(function (result) {
        callback(null, result);
    }, function (error) {
        callback(error);
    });
}
exports.callWhenDone = callWhenDone;
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.delay = delay;
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise(function (_, reject) {
            return setTimeout(function () { return reject(new Error("Timeout")); }, ms);
        }),
    ]);
}
exports.withTimeout = withTimeout;
var MIN_RETRY_DELAY = 1000;
var RETRY_BACKOFF_FACTOR = 2;
var MAX_RETRY_DELAY = 30000;
function withBackoffRetries(f, retryCount, shouldRetry) {
    if (shouldRetry === void 0) { shouldRetry = function () { return true; }; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var nextWaitTime, i, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nextWaitTime = 0;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, f()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_1 = _a.sent();
                    i++;
                    if (i >= retryCount || !shouldRetry(error_1)) {
                        throw error_1;
                    }
                    return [4 /*yield*/, delay(nextWaitTime)];
                case 5:
                    _a.sent();
                    if (!shouldRetry(error_1)) {
                        throw error_1;
                    }
                    nextWaitTime =
                        nextWaitTime === 0
                            ? MIN_RETRY_DELAY
                            : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime);
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.withBackoffRetries = withBackoffRetries;
function makeCancelToken() {
    var cancelled = false;
    return { cancel: function () { return (cancelled = true); }, isCancelled: function () { return cancelled; } };
}
exports.makeCancelToken = makeCancelToken;
function throwIfCancelled(isCancelled) {
    if (isCancelled()) {
        throw exports.CANCELLED;
    }
}
exports.throwIfCancelled = throwIfCancelled;
exports.CANCELLED = new Error("Cancelled");
