import { FullConfig } from "../types";
export interface RestPayloadSender {
    sendRestPayload: SendRestPayloadFunction;
}
export declare type SendRestPayloadFunction = (path: string, payload: Record<string, any>) => Promise<any>;
export interface RestPayloadConfig {
    url: string;
    config: FullConfig;
}
export declare function makeRestPayloadSender({ url, config, }: RestPayloadConfig): RestPayloadSender;
