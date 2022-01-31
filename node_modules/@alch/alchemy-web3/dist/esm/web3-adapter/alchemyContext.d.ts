import { FullConfig, Provider } from "../types";
import { JsonRpcSenders } from "../util/jsonRpc";
import { RestPayloadSender } from "./sendRestPayload";
export interface AlchemyContext {
    provider: any;
    restSender: RestPayloadSender;
    jsonRpcSenders: JsonRpcSenders;
    setWriteProvider(provider: Provider | null | undefined): void;
}
export declare function makeAlchemyContext(url: string, config: FullConfig): AlchemyContext;
