import type { WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isWebsocketConnectionOptions = (obj: any): obj is WebsocketConnectionOptions => {
    return obj.endpoints !== undefined && obj.channels !== undefined;
};
