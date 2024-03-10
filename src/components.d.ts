/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { TimeFrame, TradeSymbol, TradeSymbolCategory } from "./models";
export { TimeFrame, TradeSymbol, TradeSymbolCategory } from "./models";
export namespace Components {
    interface RqMtMarquee {
        "animation": boolean;
        "apiHost": string;
        "apiKey": string;
        "channels": string | string[];
        "endpoint": string;
        "namespace": string;
        "symbols": TradeSymbol[];
        "timeframe": TimeFrame;
    }
    interface RqMtRates {
        "activeTab": string;
        "animation": boolean;
        "apiHost": string;
        "apiKey": string;
        "channels": string | string[];
        "endpoint": string;
        "groups": TradeSymbolCategory[];
        "namespace": string;
        "size": 'default' | 'large';
        "timeframe": TimeFrame;
    }
    interface RqMtSpark {
        "maxHistory": number;
        "namespace": string;
        "symbol": TradeSymbol;
    }
    interface RqMtSparkline {
        "appendData": (label: string, data: number) => Promise<void>;
        "dataset": {
    labels: Array<string>,
    data: Array<number>,
  };
        "maxElements": number;
    }
}
declare global {
    interface HTMLRqMtMarqueeElement extends Components.RqMtMarquee, HTMLStencilElement {
    }
    var HTMLRqMtMarqueeElement: {
        prototype: HTMLRqMtMarqueeElement;
        new (): HTMLRqMtMarqueeElement;
    };
    interface HTMLRqMtRatesElement extends Components.RqMtRates, HTMLStencilElement {
    }
    var HTMLRqMtRatesElement: {
        prototype: HTMLRqMtRatesElement;
        new (): HTMLRqMtRatesElement;
    };
    interface HTMLRqMtSparkElement extends Components.RqMtSpark, HTMLStencilElement {
    }
    var HTMLRqMtSparkElement: {
        prototype: HTMLRqMtSparkElement;
        new (): HTMLRqMtSparkElement;
    };
    interface HTMLRqMtSparklineElement extends Components.RqMtSparkline, HTMLStencilElement {
    }
    var HTMLRqMtSparklineElement: {
        prototype: HTMLRqMtSparklineElement;
        new (): HTMLRqMtSparklineElement;
    };
    interface HTMLElementTagNameMap {
        "rq-mt-marquee": HTMLRqMtMarqueeElement;
        "rq-mt-rates": HTMLRqMtRatesElement;
        "rq-mt-spark": HTMLRqMtSparkElement;
        "rq-mt-sparkline": HTMLRqMtSparklineElement;
    }
}
declare namespace LocalJSX {
    interface RqMtMarquee {
        "animation"?: boolean;
        "apiHost"?: string;
        "apiKey"?: string;
        "channels"?: string | string[];
        "endpoint"?: string;
        "namespace"?: string;
        "symbols"?: TradeSymbol[];
        "timeframe"?: TimeFrame;
    }
    interface RqMtRates {
        "activeTab"?: string;
        "animation"?: boolean;
        "apiHost"?: string;
        "apiKey"?: string;
        "channels"?: string | string[];
        "endpoint"?: string;
        "groups"?: TradeSymbolCategory[];
        "namespace"?: string;
        "size"?: 'default' | 'large';
        "timeframe"?: TimeFrame;
    }
    interface RqMtSpark {
        "maxHistory"?: number;
        "namespace"?: string;
        "symbol"?: TradeSymbol;
    }
    interface RqMtSparkline {
        "dataset"?: {
    labels: Array<string>,
    data: Array<number>,
  };
        "maxElements"?: number;
    }
    interface IntrinsicElements {
        "rq-mt-marquee": RqMtMarquee;
        "rq-mt-rates": RqMtRates;
        "rq-mt-spark": RqMtSpark;
        "rq-mt-sparkline": RqMtSparkline;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "rq-mt-marquee": LocalJSX.RqMtMarquee & JSXBase.HTMLAttributes<HTMLRqMtMarqueeElement>;
            "rq-mt-rates": LocalJSX.RqMtRates & JSXBase.HTMLAttributes<HTMLRqMtRatesElement>;
            "rq-mt-spark": LocalJSX.RqMtSpark & JSXBase.HTMLAttributes<HTMLRqMtSparkElement>;
            "rq-mt-sparkline": LocalJSX.RqMtSparkline & JSXBase.HTMLAttributes<HTMLRqMtSparklineElement>;
        }
    }
}
