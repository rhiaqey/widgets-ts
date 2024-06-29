/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import { ClientConnectedMessage, ClientMessage, ClientSubscribedMessage, WebsocketConnection, WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';
import { TimeFrame, TradeSymbolCategory } from './models';
export { ClientConnectedMessage, ClientMessage, ClientSubscribedMessage, WebsocketConnection, WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';
export { TimeFrame, TradeSymbolCategory } from './models';
export namespace Components {
    interface RqMtMarquee {
        animation: boolean;
        connection: WebsocketConnectionOptions | WebsocketConnection;
        namespace: string;
        repeat: number;
        symbols: TradeSymbol[];
        timeframe: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtRates {
        activeTab: string;
        animation: boolean;
        connection: WebsocketConnectionOptions | WebsocketConnection;
        groups: TradeSymbolCategory[];
        namespace: string;
        size: 'default' | 'large';
        timeframe: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtSpark {
        connection: WebsocketConnectionOptions | WebsocketConnection;
        display: 'reverse' | 'default';
        maxHistory: number;
        namespace: string;
        symbol: TradeSymbol;
        timeframe: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtSparkline {
        appendData: (label: string, data: number) => Promise<void>;
        labels: Array<string>;
        maxElements: number;
        values: Array<number>;
    }
    interface RqWsConnection {
        connection: WebsocketConnectionOptions | WebsocketConnection;
        fetchSnapshot: <T = unknown>() => Promise<T>;
        getConnection: () => Promise<WebsocketConnection>;
        snapshot: WebsocketConnectionOptions['snapshot'];
    }
}
export interface RqWsConnectionCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLRqWsConnectionElement;
}
declare global {
    interface HTMLRqMtMarqueeElement extends Components.RqMtMarquee, HTMLStencilElement {}
    var HTMLRqMtMarqueeElement: {
        prototype: HTMLRqMtMarqueeElement;
        new (): HTMLRqMtMarqueeElement;
    };
    interface HTMLRqMtRatesElement extends Components.RqMtRates, HTMLStencilElement {}
    var HTMLRqMtRatesElement: {
        prototype: HTMLRqMtRatesElement;
        new (): HTMLRqMtRatesElement;
    };
    interface HTMLRqMtSparkElement extends Components.RqMtSpark, HTMLStencilElement {}
    var HTMLRqMtSparkElement: {
        prototype: HTMLRqMtSparkElement;
        new (): HTMLRqMtSparkElement;
    };
    interface HTMLRqMtSparklineElement extends Components.RqMtSparkline, HTMLStencilElement {}
    var HTMLRqMtSparklineElement: {
        prototype: HTMLRqMtSparklineElement;
        new (): HTMLRqMtSparklineElement;
    };
    interface HTMLRqWsConnectionElementEventMap {
        rqReady: [cid: string, channels: Set<string>];
        rqOpen: [cid: string];
        rqError: [cid: string, error: Error];
        rqComplete: [cid: string];
        rqConnected: [cid: string, message: ClientConnectedMessage];
        rqSubscribed: [cid: string, message: ClientSubscribedMessage];
        rqData: [cid: string, message: ClientMessage<unknown>];
        rqSnapshot: [cid: string, data: unknown];
    }
    interface HTMLRqWsConnectionElement extends Components.RqWsConnection, HTMLStencilElement {
        addEventListener<K extends keyof HTMLRqWsConnectionElementEventMap>(
            type: K,
            listener: (this: HTMLRqWsConnectionElement, ev: RqWsConnectionCustomEvent<HTMLRqWsConnectionElementEventMap[K]>) => any,
            options?: boolean | AddEventListenerOptions,
        ): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(
            type: K,
            listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
            options?: boolean | AddEventListenerOptions,
        ): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLRqWsConnectionElementEventMap>(
            type: K,
            listener: (this: HTMLRqWsConnectionElement, ev: RqWsConnectionCustomEvent<HTMLRqWsConnectionElementEventMap[K]>) => any,
            options?: boolean | EventListenerOptions,
        ): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(
            type: K,
            listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
            options?: boolean | EventListenerOptions,
        ): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLRqWsConnectionElement: {
        prototype: HTMLRqWsConnectionElement;
        new (): HTMLRqWsConnectionElement;
    };
    interface HTMLElementTagNameMap {
        'rq-mt-marquee': HTMLRqMtMarqueeElement;
        'rq-mt-rates': HTMLRqMtRatesElement;
        'rq-mt-spark': HTMLRqMtSparkElement;
        'rq-mt-sparkline': HTMLRqMtSparklineElement;
        'rq-ws-connection': HTMLRqWsConnectionElement;
    }
}
declare namespace LocalJSX {
    interface RqMtMarquee {
        animation?: boolean;
        connection?: WebsocketConnectionOptions | WebsocketConnection;
        namespace?: string;
        repeat?: number;
        symbols?: TradeSymbol[];
        timeframe?: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtRates {
        activeTab?: string;
        animation?: boolean;
        connection?: WebsocketConnectionOptions | WebsocketConnection;
        groups?: TradeSymbolCategory[];
        namespace?: string;
        size?: 'default' | 'large';
        timeframe?: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtSpark {
        connection?: WebsocketConnectionOptions | WebsocketConnection;
        display?: 'reverse' | 'default';
        maxHistory?: number;
        namespace?: string;
        symbol?: TradeSymbol;
        timeframe?: TimeFrame.H1 | TimeFrame.D1 | TimeFrame.W1 | TimeFrame.MN1;
    }
    interface RqMtSparkline {
        labels?: Array<string>;
        maxElements?: number;
        values?: Array<number>;
    }
    interface RqWsConnection {
        connection?: WebsocketConnectionOptions | WebsocketConnection;
        onRqComplete?: (event: RqWsConnectionCustomEvent<[cid: string]>) => void;
        onRqConnected?: (event: RqWsConnectionCustomEvent<[cid: string, message: ClientConnectedMessage]>) => void;
        onRqData?: (event: RqWsConnectionCustomEvent<[cid: string, message: ClientMessage<unknown>]>) => void;
        onRqError?: (event: RqWsConnectionCustomEvent<[cid: string, error: Error]>) => void;
        onRqOpen?: (event: RqWsConnectionCustomEvent<[cid: string]>) => void;
        onRqReady?: (event: RqWsConnectionCustomEvent<[cid: string, channels: Set<string>]>) => void;
        onRqSnapshot?: (event: RqWsConnectionCustomEvent<[cid: string, data: unknown]>) => void;
        onRqSubscribed?: (event: RqWsConnectionCustomEvent<[cid: string, message: ClientSubscribedMessage]>) => void;
        snapshot?: WebsocketConnectionOptions['snapshot'];
    }
    interface IntrinsicElements {
        'rq-mt-marquee': RqMtMarquee;
        'rq-mt-rates': RqMtRates;
        'rq-mt-spark': RqMtSpark;
        'rq-mt-sparkline': RqMtSparkline;
        'rq-ws-connection': RqWsConnection;
    }
}
export { LocalJSX as JSX };
declare module '@stencil/core' {
    export namespace JSX {
        interface IntrinsicElements {
            'rq-mt-marquee': LocalJSX.RqMtMarquee & JSXBase.HTMLAttributes<HTMLRqMtMarqueeElement>;
            'rq-mt-rates': LocalJSX.RqMtRates & JSXBase.HTMLAttributes<HTMLRqMtRatesElement>;
            'rq-mt-spark': LocalJSX.RqMtSpark & JSXBase.HTMLAttributes<HTMLRqMtSparkElement>;
            'rq-mt-sparkline': LocalJSX.RqMtSparkline & JSXBase.HTMLAttributes<HTMLRqMtSparklineElement>;
            'rq-ws-connection': LocalJSX.RqWsConnection & JSXBase.HTMLAttributes<HTMLRqWsConnectionElement>;
        }
    }
}
