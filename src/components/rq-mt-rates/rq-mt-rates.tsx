import { Component, Host, h, Prop, State, getAssetPath } from '@stencil/core';
import type { ClientMessage, WebsocketConnection, WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';
import type { Quote, TradeSymbol, TradeSymbolCategory } from '../../models';
import { TimeFrame } from '../../models';
import store from 'store2';

type Tick = { symbol: string; bid: string; ask: string; diff: number; timestamp: number; timeframe: TimeFrame; };
type Historical = { symbol; close: number; timestamp: number; timeframe: TimeFrame; };

@Component({
  tag: 'rq-mt-rates',
  styleUrl: 'rq-mt-rates.scss',
  shadow: true,
  assetsDirs: ['assets']
})
export class RqMtRates {

  private $selectedTab: string;

  private $symbolKeys = new Set();

  private $ticks = new Map<string, Tick>();

  private $timeFramedHistorical = new Map<string, Map<string, Historical>>();

  @Prop()
  connection: WebsocketConnectionOptions | WebsocketConnection;

  @Prop()
  groups: TradeSymbolCategory[] = [
    {
      name: "popular",
      label: "Popular",
      symbols: [
        { key: "BTCUSDm", label: "BTC/USD", image: getAssetPath('./assets/svg/BTCUSDm.svg') },
        { key: "XAUUSDm", label: "Gold/USD", image: getAssetPath('./assets/svg/XAUUSDm.svg') },
        { key: "EURUSDm", label: "EUR/USD", image: getAssetPath('./assets/svg/EURUSDm.svg') },
        { key: "USOILm", label: "US Oil", image: getAssetPath('./assets/svg/USOILm.svg') },
        { key: "ETHUSDm", label: "ETH/USD", image: getAssetPath('./assets/svg/ETHUSDm.svg') },
      ],
    },
    {
      name: "forex",
      label: "Forex",
      symbols: [
        { key: "EURUSDm", label: "EUR/USD", image: getAssetPath('./assets/svg/EURUSDm.svg') },
        { key: "USDJPYm", label: "USD/JPY", image: getAssetPath('./assets/svg/USDJPYm.svg') },
        { key: "GBPUSDm", label: "GBP/USD", image: getAssetPath('./assets/svg/GBPUSDm.svg') },
        { key: "USDCHFm", label: "USD/CHF", image: getAssetPath('./assets/svg/USDCHFm.svg') },
        { key: "USDCADm", label: "USD/CAD", image: getAssetPath('./assets/svg/USDCADm.svg') },
      ]
    },
    {
      name: "stocks",
      label: "Stocks",
      symbols: [
        { key: "USTECm", label: "US Tech 100", image: getAssetPath('./assets/svg/USTECm.svg') },
        { key: "UK100m", label: "UK 100 Index", image: getAssetPath('./assets/svg/UK100m.svg') },
        { key: "STOXX50m", label: "EU 50 Index", image: getAssetPath('./assets/svg/STOXX50m.svg') },
        { key: "HK50m", label: "HK 50 Index", image: getAssetPath('./assets/svg/HK50m.svg') },
        { key: "DE30m", label: "DE 30 Index", image: getAssetPath('./assets/svg/DE30m.svg') },
      ]
    },
    {
      name: "crypto",
      label: "Crypto",
      symbols: [
        { key: "BTCUSDm", label: "BTC/USD", image: getAssetPath('./assets/svg/BTCUSDm.svg') },
        { key: "BTCJPYm", label: "BTC/JPY", image: getAssetPath('./assets/svg/BTCJPYm.svg') },
        { key: "ETHUSDm", label: "ETH/USD", image: getAssetPath('./assets/svg/ETHUSDm.svg') },
        { key: "LTCUSDm", label: "LTC/USD", image: getAssetPath('./assets/svg/LTCUSDm.svg') },
        { key: "XRPUSDm", label: "XRP/USD", image: getAssetPath('./assets/svg/XRPUSDm.svg') },
      ]
    },
    {
      name: "shares",
      label: "Shares",
      symbols: [
        { key: "AAPLm", label: "Apple", image: getAssetPath('./assets/svg/AAPLm.svg') },
        { key: "BABAm", label: "AliBaba", image: getAssetPath('./assets/svg/BABAm.svg') },
        { key: "Cm", label: "CitiGroup", image: getAssetPath('./assets/svg/Cm.svg') },
        { key: "KOm", label: "CocaCola", image: getAssetPath('./assets/svg/KOm.svg') },
        { key: "NFLXm", label: "Netflix", image: getAssetPath('./assets/svg/NFLXm.svg') },
      ]
    },
    {
      name: "metal",
      label: "Metals",
      symbols: [
        { key: "XAUUSDm", label: "Gold/USD", image: getAssetPath('./assets/svg/XAUUSDm.svg') },
        { key: "XAGUSDm", label: "Silver/USD", image: getAssetPath('./assets/svg/XAGUSDm.svg') },
        { key: "USOILm", label: "US Crude Oil", image: getAssetPath('./assets/svg/USOILm.svg') },
        { key: "XPDUSDm", label: "Palladium/USD", image: getAssetPath('./assets/svg/XPDUSDm.svg') },
        { key: "XPTUSDm", label: "Platinum/USD", image: getAssetPath('./assets/svg/XPTUSDm.svg') },
      ]
    }
  ];

  @Prop()
  animation = true;

  @Prop()
  namespace = "rq-mt-rates";

  @Prop()
  size: 'default' | 'large' = 'default'

  @Prop()
  activeTab = "popular"

  @Prop()
  timeframe = TimeFrame.D1;

  @State()
  last_update = Date.now();

  private handleSnapshot(_event: [cid: string, data: unknown]) {
    console.log('>> snapshot event', _event);
  }

  private handleData(event: [cid: string, message: ClientMessage<unknown>]) {
    this.saveQuote(event[1].get_value() as Quote);
  }

  private getDiffPercent(old_val: number, new_val: number) {
    const percentageChange = ((new_val - old_val) / Math.abs(old_val)) * 100;
    return percentageChange;
  }

  private getDiff(quote: Quote) {
    let diff = 0;

    // first check if there is a historical for prop timeframe + symbol
    if (this.$timeFramedHistorical.has(this.timeframe)) {
      if (this.$timeFramedHistorical.get(this.timeframe).has(quote.symbol)) {
        const prev_close = this.$timeFramedHistorical.get(this.timeframe).get(quote.symbol).close;
        diff = this.getDiffPercent(prev_close, quote.data.tick.bid);
      }
    }

    // then fallback to the first timeframe + symbol found
    if (diff === 0) {
      for (const timeframe of this.$timeFramedHistorical.keys()) {
        if (this.$timeFramedHistorical.get(timeframe).has(quote.symbol)) {
          const prev_close = this.$timeFramedHistorical.get(timeframe).get(quote.symbol).close;
          diff = this.getDiffPercent(prev_close, quote.data.tick.bid);
          break;
        }
      }
    }

    return diff;
  }

  private saveTick(quote: Quote) {
    if (this.$ticks.has(quote.symbol)) {
      // If we have a newer tick we set it as the last
      if (this.$ticks.get(quote.symbol).timestamp < quote.data.tick.time_msc) {
        this.$ticks.set(quote.symbol, {
          symbol: quote.symbol,
          ask: Number.parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
          bid: Number.parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
          timestamp: quote.data.tick.time_msc,
          timeframe: quote.timeframe,
          diff: this.getDiff(quote)
        });
      }
    } else {
      this.$ticks.set(quote.symbol, {
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
      return console.warn('historical quote has no timeframe', quote);
    }

    if (!this.$timeFramedHistorical.has(quote.timeframe)) {
      this.$timeFramedHistorical.set(quote.timeframe, new Map<string, Historical>());
    }

    // Normalize timestamp to milliseconds
    const timestamp = new Date(quote.data.historical.datetime).getFullYear() === 1970 ?
      quote.data.historical.datetime * 1000 :
      quote.data.historical.datetime;

    if (this.$timeFramedHistorical.get(quote.timeframe).has(quote.symbol)) {
      // Quote found cached
      if (this.$timeFramedHistorical.get(quote.timeframe).get(quote.symbol).timestamp < timestamp) {
        // Since timestamp of new is greater then we need to update
        this.$timeFramedHistorical.get(quote.timeframe).set(quote.symbol, {
          symbol: quote.symbol,
          close: quote.data.historical.close,
          timestamp,
          timeframe: quote.timeframe
        });
      }
    } else {
      // Quote was not found
      this.$timeFramedHistorical.get(quote.timeframe).set(quote.symbol, {
        symbol: quote.symbol,
        close: quote.data.historical.close,
        timestamp,
        timeframe: quote.timeframe
      });
    }
  }

  private saveQuote(quote: Quote) {
    if (!this.$symbolKeys.has(quote.symbol)) {
      return;
    }

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
        this.$ticks = new Map(Array.from(ns.get('ticks')).map((tick: Tick) => {
          return [tick.symbol, tick]
        }));
      } else if (entry.startsWith('historical:')) {
        render = true;
        const data = Array.from(ns.get(entry));
        const timeframe = entry.substring(11);
        this.$timeFramedHistorical.set(timeframe, new Map(data.map((tick: Historical) => [tick.symbol, tick])));
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
    ns.set('ticks', Array.from(this.$ticks.values()), true);
    for (const entry of this.$timeFramedHistorical.entries()) {
      ns.set(`historical:${entry[0]}`, Array.from(entry[1].values()), true);
    }
  }

  connectedCallback() {
    this.loadQuotes();

    for (const group of this.groups) {
      if (group.name === this.activeTab) {
        this.$selectedTab = this.activeTab;
      }

      for (const symbol of group.symbols) {
        this.$symbolKeys.add(symbol.key);
      }
    }

    if (!this.$selectedTab) {
      this.$selectedTab = this.groups[0].name;
    }
  }

  private selectCategory(cat: TradeSymbolCategory) {
    this.$selectedTab = cat.name;
  }

  private getEmptyRatePlaceholder() {
    return <div class="column-values">
      <div class="icon">&nbsp;</div>
      <div class="name">&nbsp;</div>
      <div class="sell">&nbsp;</div>
      <div class="buy">&nbsp;</div>
      <div class="spread">&nbsp;</div>
      <div class="change">&nbsp;</div>
      <div class="action">&nbsp;</div>
    </div>
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

  private getRate(tick: Tick, symbol: TradeSymbol, category: TradeSymbolCategory) {
    return <div class="column-values">
      <div class="icon">
        <img alt={tick.symbol} class={`${symbol.key} ${category.name}`} src={symbol.image} />
      </div>
      <div class="name">
        <div class="name"><span>{symbol.label}</span></div>
      </div>
      <div class="sell"><span>{tick.bid}</span></div>
      <div class="buy"><span>{tick.ask}</span></div>
      <div class="spread"><span>0</span></div>
      <div class="change">
        <span class={this.getTickDiffClass(tick.diff)}>
          {tick.diff === 0 ? "" : tick.diff > 0 ? "+" : ""}
          {Number.parseFloat(`${tick.diff}`).toFixed(2)}%
        </span>
      </div>
      <div class="action">
        <button type="button">Trade</button>
      </div>
    </div>
  }

  render() {
    return (
      <Host>
        <rq-ws-connection
          snapshot={true}
          connection={this.connection}
          onRqSnapshot={ev => this.handleSnapshot(ev.detail)}
          onRqData={ev => this.handleData(ev.detail)} />
        <div class={`size-default size-${this.size} with-tabs with-names}`}>
          <div>
            <div class={(this.groups[this.groups.length - 1].name === this.$selectedTab) ? "active right-faded" : "right-faded"} />
            <header>
              <ul class="categories">
                {this.groups.map((group) => {
                  return <li onMouseDown={_ => this.selectCategory(group)} class={group.name === this.$selectedTab ? `${group.name} active` : group.name}>
                    <span>{group.label}</span>
                  </li>;
                })}
              </ul>
            </header>
          </div>
          <section class="body">
            <div class="column-names">
              <div class="icon"><span>&nbsp;</span></div>
              <div class="name"><span>Name</span></div>
              <div class="sell"><span>Sell</span></div>
              <div class="buy"><span>Buy</span></div>
              <div class="spread"><span>Spread</span></div>
              <div class="change"><span>Change</span></div>
              <div class="action"><span>&nbsp;</span></div>
            </div>
            {this.groups.map(group => {
              return <div class={group.name === this.$selectedTab ? "symbol-group active" : "symbol-group"}>
                {group.symbols.map(symbol => {
                  if (this.$ticks.has(symbol.key)) {
                    const sm = this.$ticks.get(symbol.key);
                    return this.getRate(sm, symbol, group);
                  }

                  return this.getEmptyRatePlaceholder();
                })}
              </div>
            })}
          </section>
        </div>
      </Host>
    );
  }
}
