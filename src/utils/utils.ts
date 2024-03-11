import type { WebsocketConnectionOptions } from "@rhiaqey/sdk-ts";

export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isWebsocketConnectionOptions = (obj: any): obj is WebsocketConnectionOptions => {
  return obj.endpoint !== undefined && obj.channels !== undefined;
};
