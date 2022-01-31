import { Web3Callback } from "../types";
/**
 * Helper for converting functions which take a callback as their final argument
 * to functions which return a promise.
 */
export declare function promisify<T>(f: (callback: Web3Callback<T>) => void): Promise<T>;
/**
 * Helper for converting functions which return a promise to functions which
 * take a callback as their final argument.
 */
export declare function callWhenDone<T>(promise: Promise<T>, callback: Web3Callback<T>): void;
export declare function delay(ms: number): Promise<void>;
export declare function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
export declare function withBackoffRetries<T>(f: () => Promise<T>, retryCount: number, shouldRetry?: (error: unknown) => boolean): Promise<T>;
export interface CancelToken {
    cancel(): void;
    isCancelled(): boolean;
}
export declare function makeCancelToken(): CancelToken;
export declare function throwIfCancelled(isCancelled: () => boolean): void;
export declare const CANCELLED: Error;
