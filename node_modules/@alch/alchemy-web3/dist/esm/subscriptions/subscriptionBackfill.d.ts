import { JsonRpcSenders } from "../util/jsonRpc";
export interface NewHeadsEvent {
    author: string;
    difficulty: string;
    extraData: string;
    gasLimit: string;
    gasUsed: string;
    hash: string;
    logsBloom: string;
    miner: string;
    mixHash: string;
    nonce: string;
    number: string;
    parentHash: string;
    receiptsRoot: string;
    sealFields: string[];
    sha3Uncles: string;
    size: string;
    stateRoot: string;
    timestamp: string;
    transactionsRoot: string;
}
/**
 * The return type of eth_getBlocksByHash.
 */
export interface BlockHead extends NewHeadsEvent {
    totalDifficulty: string;
    transactions: any[];
    uncles: string[];
}
export interface LogsEvent {
    address: string;
    blockHash: string;
    blockNumber: string;
    data: string;
    logIndex: string;
    topics: string[];
    transactionHash: string;
    transactionIndex: string;
    removed?: boolean;
}
export interface LogsSubscriptionFilter {
    address?: string | string[];
    topics?: Array<string | string[] | null>;
}
export declare type Backfiller = ReturnType<typeof makeBackfiller>;
export declare function makeBackfiller(jsonRpcSenders: JsonRpcSenders): {
    getNewHeadsBackfill: (isCancelled: () => boolean, previousHeads: NewHeadsEvent[], fromBlockNumber: number) => Promise<NewHeadsEvent[]>;
    getLogsBackfill: (isCancelled: () => boolean, filter: LogsSubscriptionFilter, previousLogs: LogsEvent[], fromBlockNumber: number) => Promise<LogsEvent[]>;
};
export declare function dedupeNewHeads(events: NewHeadsEvent[]): NewHeadsEvent[];
export declare function dedupeLogs(events: LogsEvent[]): LogsEvent[];
