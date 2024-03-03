import { Component, Host, h, Prop, State, getAssetPath } from '@stencil/core';
import { ClientConnectedMessage, ClientSubscribedMessage, WebsocketConnection } from '@rhiaqey/sdk-ts';
import { filter, Subscription } from 'rxjs';
import { Quote, TradeSymbol, TradeSymbolCategory } from '../../models';

type Tick = { symbol: string; bid: string; ask: string; spread: string; diff: number; timestamp: number; };
type Historical = { symbol; close: number; timestamp: number; };

@Component({
  tag: 'rq-mt-rates',
  styleUrl: 'rq-mt-rates.scss',
  shadow: true,
  assetsDirs: [ 'assets' ]
})
export class RqMtRates {
  private connection: WebsocketConnection;
  private subscriptions = new Subscription();
  private ticks = new Map<string, Tick>();
  private historical = new Map<string, Historical>();

  @Prop()
  endpoint: string;

  @Prop()
  apiKey: string;

  @Prop()
  apiHost: string;

  @Prop()
  channels: string | string[];

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
  namespace = "rq-mt-marquee";

  @Prop()
  size: 'default' | 'large' = 'default'

  @Prop()
  @State()
  selected_tab = "popular"

  @State()
  last_update = Date.now();

  private setupListeners() {
    const channels = typeof this.channels === 'string' ? this.channels.split(',') : this.channels;

    this.subscriptions.add(this.connection.dataStream<ClientConnectedMessage>().pipe(
      filter(message => message.is_connected_type()),
    ).subscribe(message => {
      console.log('client connected', message.get_value().client_id);
    }));

    for (const channel of channels) {
      this.subscriptions.add(this.connection.channelStream<ClientSubscribedMessage>(channel).pipe(
        filter(message => message.is_subscribed_type()),
      ).subscribe(() => {
        console.log('client subscribed to channel', channel);
      }));

      this.subscriptions.add(this.connection.channelStream(channel).pipe(
        filter(message => message.is_data_type()),
      ).subscribe(message => {
        this.saveQuote(message.get_value() as Quote);
      }));
    }
  }

  private get_diff(old_val: number, new_val: number) {
    const percentageChange = ((new_val - old_val) / Math.abs(old_val)) * 100;  
    return percentageChange;
  }

  private saveQuote(quote: Quote) {
    if (quote.data.tick) {
      if (this.ticks.has(quote.symbol)) {
        if (this.ticks.get(quote.symbol).timestamp < quote.data.tick.time_msc) {
          let diff = 0;

          if (this.historical.has(quote.symbol)) {
            const prev_close = this.historical.get(quote.symbol).close;
            diff = this.get_diff(prev_close, quote.data.tick.bid);
          }

          this.ticks.set(quote.symbol, {
            symbol: quote.symbol,
            ask: parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
            bid: parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
            spread: "0",
            timestamp: quote.data.tick.time_msc,
            diff: diff
          });
        }

      } else {
        this.ticks.set(quote.symbol, {
          symbol: quote.symbol,
          ask: parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
          bid: parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
          spread: "0",
          timestamp: quote.data.tick.time_msc,
          diff: 0
        });
      }

      this.saveQuotes();
      this.last_update = Date.now();
    } else if (quote.data.historical) {
      if (this.historical.has(quote.symbol)) {
        if (this.historical.get(quote.symbol).timestamp < quote.data.historical.datetime) {
          this.historical.set(quote.symbol, {
            symbol: quote.symbol,
            close: quote.data.historical.close,
            timestamp: quote.data.historical.datetime
          });
        }
      } else {
        this.historical.set(quote.symbol, {
          symbol: quote.symbol,
          close: quote.data.historical.close,
          timestamp: quote.data.historical.datetime
        });
      }

      this.saveQuotes();
      this.last_update = Date.now();
    }
  }

  private loadQuotes() {
    //
  }

  private saveQuotes() {
    //
  }

  componentWillLoad() {
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

  connectedCallback() {
    this.renderGroups();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribe();
  }

  private renderGroups() {
    let set_false_counter = 0;

    for (let index = 0; index < this.groups.length; index++) {
        if (this.groups[index].name === this.selected_tab) {
            this.groups[index].active = true;
        } else {
            set_false_counter++;
            this.groups[index].active = false;
        }
    }

    if (set_false_counter > 0 && (this.groups.length === set_false_counter)) {
        this.groups[0].active = true;
    }
  }

  private selectCategory(cat: TradeSymbolCategory) {
    this.selected_tab = cat.name;
    this.renderGroups();
  }

  getEmptyRatePlaceholder() {
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

  getRate(tick: Tick, symbol: TradeSymbol, category: TradeSymbolCategory) {
    return <div class="column-values">
      <div class="icon">
        <img alt={tick.symbol} class={`${symbol.key} ${category.name}`} src={symbol.image} />
      </div>
      <div class="name">
        <div class="name"><span>{symbol.label}</span></div>
      </div>
      <div class="sell"><span>{tick.bid}</span></div>
      <div class="buy"><span>{tick.ask}</span></div>
      <div class="spread"><span>{tick.spread}</span></div>
      <div class="change">
      <span class={tick.diff > 0 ? 'change up' : (tick.diff < 0 ? 'change down' : 'change')}>
        {tick.diff === 0 ? "" : tick.diff > 0 ? "+": ""}
        {parseFloat(`${tick.diff}`).toFixed(2)}%
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
        <div class={`size-default size-${this.size} with-tabs with-names}`}>
          <div>
            <div class={(this.groups[this.groups.length - 1].active) ? "active right-faded" : "right-faded"} />
            <header>
              <ul class="categories">
                {this.groups.map(group => {
                  return <li onMouseDown={_ => this.selectCategory(group)} class={group.active ? `${group.name} active` : group.name}>
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
                return <div class={group.active ? "symbol-group active" : "symbol-group"}>
                  {group.symbols.map(symbol => {
                      if (this.ticks.has(symbol.key)) {
                          const sm = this.ticks.get(symbol.key);
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