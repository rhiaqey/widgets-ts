export type TradeSymbol = {
    key: string;
    label: string;
    image: string;
}

export type Quote = {
    symbol: string;
    info: {
        digits: number;
        period: number;
    };
    data: {
        tick?: {
            ask: number;
            bid: number;
            datetime: number;
            flags: number;
            last: number;
            time_msc: number;
            volume: number;
            volume_real: number;
        };
        historical?: {
            bars: number;
            close: number;
            datetime: number;
            high: number;
            low: number;
            open: number;
            volume: number;
        }
    }
};
