import { isWebsocketConnectionOptions } from './utils';

describe('isWebsocketConnectionOptions', () => {
    const connection1 = {
        channels: [],
        endpoints: [],
    };

    const connection2 = {
        channels: [],
        endpoint: '',
    };

    it('identifies correctly a websocket connection', () => {
        expect(isWebsocketConnectionOptions(connection1)).toBe(true);
    });

    it('does not identify correctly a websocket connection', () => {
        expect(isWebsocketConnectionOptions(connection2)).toBe(false);
    });
});
