import { JsonRpcId, JsonRpcRequest, JsonRpcResponse, SendJsonRpcFunction } from "../types";
import { SendJsonRpcPayloadFunction } from "../web3-adapter/sendJsonRpcPayload";
export declare type JsonRpcPayloadFactory = (method: string, params?: any[]) => JsonRpcRequest;
export interface JsonRpcSenders {
    send: SendJsonRpcFunction;
    sendBatch(parts: BatchPart[]): Promise<any[]>;
}
export interface BatchPart {
    method: string;
    params?: any;
}
export declare function makeJsonRpcPayloadFactory(): JsonRpcPayloadFactory;
export declare function makeJsonRpcSenders(sendJsonRpcPayload: SendJsonRpcPayloadFunction, makeJsonRpcPayload: JsonRpcPayloadFactory): JsonRpcSenders;
export declare function makeResponse<T>(id: JsonRpcId, result: T): JsonRpcResponse<T>;
