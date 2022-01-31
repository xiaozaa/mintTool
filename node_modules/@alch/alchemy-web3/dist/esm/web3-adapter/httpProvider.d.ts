import { SingleOrBatchRequest, SingleOrBatchResponse, Web3Callback } from "../types";
import { SendJsonRpcPayloadFunction } from "./sendJsonRpcPayload";
/**
 * Returns a "provider" which can be passed to the Web3 constructor.
 */
export declare function makeAlchemyHttpProvider(sendJsonRpcPayload: SendJsonRpcPayloadFunction): {
    send: (payload: SingleOrBatchRequest, callback: Web3Callback<SingleOrBatchResponse>) => void;
};
