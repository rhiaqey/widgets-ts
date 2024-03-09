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

export type TradeSymbolCategory = {
    name: string;
    label: string;
    active?: boolean;
    symbols: Array<TradeSymbol>;
}

export enum TimeFrame {
    M1 = "m1",
    M2 = "m2",
    M3 = "m3",
    M4 = "m4",
    M5 = "m5",
    M6 = "m6",
    M10 = "m10",
    M12 = "m12",
    M15 = "m15",
    M20 = "m20",
    M30 = "m30",
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    H4 = "h4",
    H6 = "h6",
    H8 = "h8",
    H12 = "h12",
    D1 = "d1",
    W1 = "w1",
    MN1 = "mn1",
    OTHER = "other",
};