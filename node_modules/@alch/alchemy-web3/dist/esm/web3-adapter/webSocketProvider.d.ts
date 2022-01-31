import EventEmitter from "eventemitter3";
import SturdyWebSocket from "sturdy-websocket";
import { SingleOrBatchRequest, SingleOrBatchResponse } from "../types";
import { JsonRpcSenders } from "../util/jsonRpc";
import { SendJsonRpcPayloadFunction } from "./sendJsonRpcPayload";
/**
 * This is the undocumented interface required by Web3 for providers which
 * handle subscriptions.
 *
 * In addition to the stated methods here, it communicates subscription events
 * by using `EventEmitter#emit("data", event)` to emit the events.
 */
export interface Web3SubscriptionProvider extends EventEmitter {
    send(payload: SingleOrBatchRequest, callback: (error: any, response?: SingleOrBatchResponse) => void): void;
    disconnect(code?: number, reason?: string): void;
    supportsSubscriptions(): true;
    connect(): void;
    reset(): void;
    reconnect(): void;
}
export declare class AlchemyWebSocketProvider extends EventEmitter implements Web3SubscriptionProvider {
    private readonly ws;
    private readonly sendJsonRpcPayload;
    private readonly jsonRpcSenders;
    private readonly virtualSubscriptionsById;
    private readonly virtualIdsByPhysicalId;
    private readonly backfiller;
    private heartbeatIntervalId?;
    private cancelBackfill;
    constructor(ws: SturdyWebSocket, sendJsonRpcPayload: SendJsonRpcPayloadFunction, jsonRpcSenders: JsonRpcSenders);
    send(request: SingleOrBatchRequest, callback: (error: any, response?: SingleOrBatchResponse) => void): void;
    supportsSubscriptions(): true;
    disconnect(code?: number, reason?: string): void;
    connect(): void;
    reset(): void;
    reconnect(): void;
    private subscribe;
    private unsubscribe;
    private addSocketListeners;
    private removeSocketListeners;
    private startHeartbeat;
    private stopHeartbeatAndBackfill;
    private handleMessage;
    private handleReopen;
    private resubscribeAndBackfill;
    private getBlockNumber;
    private emitNewHeadsEvent;
    private emitLogsEvent;
    /**
     * Emits an event to consumers, but also remembers it in its subscriptions's
     * `sentEvents` buffer so that we can detect re-orgs if the connection drops
     * and needs to be reconnected.
     */
    private emitAndRememberEvent;
    private emitGenericEvent;
}
