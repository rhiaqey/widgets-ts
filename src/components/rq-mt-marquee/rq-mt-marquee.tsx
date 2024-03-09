import { Component, Host, h, Prop, State } from '@stencil/core';
import { type ClientConnectedMessage, type ClientSubscribedMessage, WebsocketConnection } from '@rhiaqey/sdk-ts';
import { filter, map, Subscription } from 'rxjs';
import type { Quote, TradeSymbol as BaseTradeSymbol } from '../../models';
import { TimeFrame } from '../../models';
import store from 'store2';

type Tick = { symbol: string; bid: string; ask: string; diff: number; timestamp: number; timeframe: TimeFrame; };
type Historical = { symbol; close: number; timestamp: number; timeframe: TimeFrame; };
type TradeSymbol = Omit<BaseTradeSymbol, 'image'>;

@Component({
  tag: 'rq-mt-marquee',
  styleUrl: 'rq-mt-marquee.scss',
  shadow: true
})
export class RqMtMarquee {
  private connection: WebsocketConnection;
  private subscriptions = new Subscription();
  private ticks = new Map<string, Tick>();
  private timeFramedHistorical = new Map<string, Map<string, Historical>>();

  @Prop()
  endpoint: string;

  @Prop()
  apiKey: string;

  @Prop()
  apiHost: string;

  @Prop()
  channels: string | string[];

  @Prop()
  symbols: TradeSymbol[] = [
    { key: "BTCUSDm", label: "BTC/USD" },
    { key: "XAUUSDm", label: "Gold/USD" },
    { key: "EURUSDm", label: "EUR/USD" },
    { key: "USOILm", label: "US Oil" },
    { key: "ETHUSDm", label: "ETH/USD" },
    //
    { key: "EURUSDm", label: "EUR/USD" },
    { key: "USDJPYm", label: "USD/JPY" },
    { key: "GBPUSDm", label: "GBP/USD" },
    { key: "USDCHFm", label: "USD/CHF" },
    { key: "USDCADm", label: "USD/CAD" },
    //
    { key: "USTECm", label: "US Tech 100" },
    { key: "UK100m", label: "UK 100 Index" },
    { key: "STOXX50m", label: "EU 50 Index" },
    { key: "HK50m", label: "HK 50 Index" },
    { key: "DE30m", label: "DE 30 Index" },
    //
    { key: "XAUUSDm", label: "Gold/USD" },
    { key: "XAGUSDm", label: "Silver/USD" },
    { key: "USOILm", label: "US Crude Oil" },
    { key: "XPDUSDm", label: "Palladium/USD" },
    { key: "XPTUSDm", label: "Platinum/USD" },
    //
    { key: "AAPLm", label: "Apple" },
    { key: "BABAm", label: "AliBaba" },
    { key: "Cm", label: "CitiGroup" },
    { key: "KOm", label: "CocaCola" },
    { key: "NFLXm", label: "Netflix" },
  ];

  @Prop()
  animation = true;

  @Prop()
  namespace = "rq-mt-marquee";

  @Prop()
  timeframe = TimeFrame.D1;

  @State()
  last_update = Date.now();

  private setupListeners() {
    const cid = this.connection.getId();
    const channels = typeof this.channels === 'string' ? this.channels.split(',') : this.channels;

    this.subscriptions.add(this.connection.eventStream().pipe(
      filter(event => event[0] === 'ready'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection ready`);
    }));

    this.subscriptions.add(this.connection.eventStream().pipe(
      filter(event => event[0] === 'open'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection open`);
    }));

    this.subscriptions.add(this.connection.dataStream<ClientConnectedMessage>().pipe(
      filter(message => message.is_connected_type()),
    ).subscribe((message) => {
      console.log(`client[${cid}] connected`, message.get_value().client_id);
    }));

    this.subscriptions.add(this.connection.eventStream().pipe(
      filter(event => event[0] === 'error'),
      map(event => event[1])
    ).subscribe((error) => {
      console.warn(`client[${cid}] connection error`, error);
    }));

    this.subscriptions.add(this.connection.eventStream().pipe(
      filter(event => event[0] === 'complete'),
    ).subscribe(() => {
      console.log(`client[${cid}] connection complete`);
    }));

    for (const channel of channels) {
      this.subscriptions.add(this.connection.channelStream<ClientSubscribedMessage>(channel).pipe(
        filter(message => message.is_subscribed_type()),
      ).subscribe(() => {
        console.log(`client[${cid}] subscribed to channel`, channel);
      }));

      this.subscriptions.add(this.connection.channelStream(channel).pipe(
        filter(message => message.is_data_type()),
      ).subscribe((message) => {
        this.saveQuote(message.get_value() as Quote);
      }));
    }
  }

  private getDiffPercent(old_val: number, new_val: number) {
    const percentageChange = ((new_val - old_val) / Math.abs(old_val)) * 100;
    return percentageChange;
  }

  private getDiff(quote: Quote) {
    let diff = 0;

    // first check if there is a historical for prop timeframe + symbol
    if (this.timeFramedHistorical.has(this.timeframe)) {
      if (this.timeFramedHistorical.get(this.timeframe).has(quote.symbol)) {
        const prev_close = this.timeFramedHistorical.get(this.timeframe).get(quote.symbol).close;
        diff = this.getDiffPercent(prev_close, quote.data.tick.bid);
      }
    }

    // then fallback to the first timeframe + symbol found
    if (diff === 0) {
      for (const timeframe of this.timeFramedHistorical.keys()) {
        if (this.timeFramedHistorical.get(timeframe).has(quote.symbol)) {
          const prev_close = this.timeFramedHistorical.get(timeframe).get(quote.symbol).close;
          diff = this.getDiffPercent(prev_close, quote.data.tick.bid);
          break;
        }
      }
    }

    return diff;
  }

  private saveTick(quote: Quote) {
    if (this.ticks.has(quote.symbol)) {
      // If we have a newer tick we set it as the last
      if (this.ticks.get(quote.symbol).timestamp < quote.data.tick.time_msc) {
        this.ticks.set(quote.symbol, {
          symbol: quote.symbol,
          ask: Number.parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
          bid: Number.parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
          timestamp: quote.data.tick.time_msc,
          timeframe: quote.timeframe,
          diff: this.getDiff(quote)
        });
      }
    } else {
      this.ticks.set(quote.symbol, {
        symbol: quote.symbol,
        ask: Number.parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
        bid: Number.parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
        timestamp: quote.data.tick.time_msc,
        timeframe: quote.timeframe,
        diff: this.getDiff(quote)
      });
    }
  }

  private saveHistorical(quote: Quote) {
    if (!quote.timeframe) {
      // console.warn('historical quote has no timeframe', quote);
      return;
    }

    if (!this.timeFramedHistorical.has(quote.timeframe)) {
      this.timeFramedHistorical.set(quote.timeframe, new Map<string, Historical>());
    }

    // Normalize timestamp to milliseconds
    const timestamp = new Date(quote.data.historical.datetime).getFullYear() === 1970 ?
      quote.data.historical.datetime * 1000 :
      quote.data.historical.datetime;

    if (this.timeFramedHistorical.get(quote.timeframe).has(quote.symbol)) {
      // Quote found cached
      if (this.timeFramedHistorical.get(quote.timeframe).get(quote.symbol).timestamp < timestamp) {
        // Since timestamp of new is greater then we need to update
        this.timeFramedHistorical.get(quote.timeframe).set(quote.symbol, {
          symbol: quote.symbol,
          close: quote.data.historical.close,
          timestamp,
          timeframe: quote.timeframe
        })
      }
    } else {
      // Quote was not found
      this.timeFramedHistorical.get(quote.timeframe).set(quote.symbol, {
        symbol: quote.symbol,
        close: quote.data.historical.close,
        timestamp,
        timeframe: quote.timeframe
      })
    }
  }

  private saveQuote(quote: Quote) {
    if (quote.data.tick) {
      this.saveTick(quote);
      this.saveQuotes();
      this.last_update = Date.now();
    } else if (quote.data.historical) {
      this.saveHistorical(quote);
      this.saveQuotes();
      this.last_update = Date.now();
    } else {
      console.warn("unsupported quote");
    }
  }

  private loadQuotes() {
    let render = false;
    const ns = store.namespace(this.namespace);

    ns.each(entry => {
      if (entry === 'ticks') {
        render = true;
        this.ticks = new Map(Array.from(ns.get('ticks')).map((tick: Tick) => {
          return [tick.symbol, tick]
        }));
      } else if (entry.startsWith('historical:')) {
        render = true;
        const data = Array.from(ns.get(entry));
        const timeframe = entry.substring(11);
        this.timeFramedHistorical.set(timeframe, new Map(data.map((tick: Historical) => [tick.symbol, tick])));
      } else {
        console.warn('unsupported entry', entry)
      }
    });

    if (render) {
      this.last_update = Date.now();
    }
  }

  private saveQuotes() {
    const ns = store.namespace(this.namespace);
    ns.set('ticks', Array.from(this.ticks.values()), true);
    for (const entry of this.timeFramedHistorical.entries()) {
      ns.set(`historical:${entry[0]}`, Array.from(entry[1].values()), true);
    }
  }

  connectedCallback() {
    this.loadQuotes();

    this.connection = new WebsocketConnection({
      endpoint: this.endpoint,
      apiKey: this.apiKey,
      apiHost: this.apiHost,
      channels: [].concat(this.channels),
      snapshot: true,
    });

    this.setupListeners();

    this.connection.connect();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribe();
  }

  private getTickDiffClass(diff: number) {
    if (diff > 0) {
      return 'change up';
    }

    if (diff < 0) {
      return 'change down';
    }

    return 'change';
  }

  private renderSymbol(symbol: TradeSymbol) {
    const tick = this.ticks.get(symbol.key);
    return <div class="quote">
      <span class="symbol">{symbol.label}</span>
      <span class="bid">{tick.bid}</span>
      <span class={this.getTickDiffClass(tick.diff)}>
        {tick.diff === 0 ? "" : tick.diff > 0 ? "+" : ""}
        {Number.parseFloat(`${tick.diff}`).toFixed(2)}%
      </span>
    </div>
  }

  render() {
    const classes = ["size-default"];
    const tickerClass = ["ticker__list"];
    if (!this.animation) tickerClass.push("no-animation");
    return (
      <Host>
        <div class={classes.join(" ")}>
          <div class="quotes">
            <div class={tickerClass.join(" ")}>
              {this.symbols.filter(symbol => this.ticks.has(symbol.key)).map(symbol => {
                return this.renderSymbol(symbol);
              })}
            </div>
          </div>
        </div>
      </Host>
    );
  }

}
