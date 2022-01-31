import { FullConfig, JsonRpcRequest, JsonRpcResponse, Provider, SingleOrBatchRequest, SingleOrBatchResponse } from "../types";
import { AlchemySendJsonRpcFunction } from "./alchemySend";
export interface JsonRpcPayloadSender {
    sendJsonRpcPayload: SendJsonRpcPayloadFunction;
    setWriteProvider(writeProvider: Provider | null | undefined): void;
}
export interface SendJsonRpcPayloadFunction {
    (payload: JsonRpcRequest): Promise<JsonRpcResponse>;
    (payload: SingleOrBatchRequest): Promise<SingleOrBatchResponse>;
}
export declare function makeJsonRpcPayloadSender(alchemySendJsonRpc: AlchemySendJsonRpcFunction, config: FullConfig): JsonRpcPayloadSender;
