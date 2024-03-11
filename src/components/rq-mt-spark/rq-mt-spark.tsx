import { Component, Host, Prop, State, h } from '@stencil/core';
import type { RqMtSparkline } from '../rq-mt-sparkline/rq-mt-sparkline';
import { TimeFrame, type TradeSymbol as BaseTradeSymbol, type Quote } from '../../models';
import type { ClientMessage, WebsocketConnection, WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';
import store from 'store2';

type Tick = { symbol: string; bid: string; ask: string; timestamp: number; timeframe: TimeFrame; };
type Historical = { symbol; close: number; timestamp: number; timeframe: TimeFrame; };
type TradeSymbol = Omit<BaseTradeSymbol, 'image'>;

@Component({
  tag: 'rq-mt-spark',
  styleUrl: 'rq-mt-spark.scss',
  shadow: true,
})
export class RqMtSpark {

  private $sparkline!: RqMtSparkline;

  private $last_tick: Tick;

  private $timeFramedHistorical = new Map<string, Map<string, Historical[]>>();

  @Prop()
  connection: WebsocketConnectionOptions | WebsocketConnection;

  @Prop()
  symbol: TradeSymbol;

  @Prop()
  maxHistory = 30;

  @Prop()
  display: 'reverse' | 'default' = 'default';

  @Prop()
  namespace = "rq-mt-spark";

  @Prop()
  timeframe = TimeFrame.D1;

  @State()
  last_update = Date.now();

  connectedCallback() {
    this.loadQuotes();
  }

  setRef(el) {
    if (!this.$sparkline) {
      this.$sparkline = el as RqMtSparkline;
      if (this.$timeFramedHistorical.has(this.timeframe)) {
        if (this.$timeFramedHistorical.get(this.timeframe).has(this.symbol.key)) {
          const entries = this.$timeFramedHistorical.get(this.timeframe).get(this.symbol.key);
          const labels = entries.map(entry => new Date(entry.timestamp).toISOString());
          const values = entries.map(entry => entry.close);
          this.$sparkline.labels = labels;
          this.$sparkline.values = values;
        }
      }
    }
  }

  private loadQuotes() {
    const ns = store.namespace(`${this.namespace}:${this.symbol.key}`);

    ns.each(entry => {
      if (entry === 'tick') {
        this.$last_tick = ns.get(entry) as Tick;
      } else if (entry === `historical:${this.timeframe}`) {
        const entries = ns.get(entry);

        // if no map setup
        if (!this.$timeFramedHistorical.has(this.timeframe)) {
          this.$timeFramedHistorical.set(this.timeframe, new Map<string, Historical[]>());
        }

        this.$timeFramedHistorical.get(this.timeframe).set(this.symbol.key, entries);
      } else {
        console.warn('unsupported entry', entry)
      }
    });
  }

  private saveQuotes() {
    const ns = store.namespace(`${this.namespace}:${this.symbol.key}`);

    if (this.$last_tick) {
      ns.set('tick', this.$last_tick, true);
    }

    if (this.$timeFramedHistorical.has(this.timeframe)) {
      if (this.$timeFramedHistorical.get(this.timeframe).has(this.symbol.key)) {
        ns.set(`historical:${this.timeframe}`,
          this.$timeFramedHistorical.get(this.timeframe).get(this.symbol.key), true);
      }
    }
  }

  private saveTick(quote: Quote) {
    if (!this.$last_tick) {
      this.$last_tick = {
        symbol: quote.symbol,
        ask: Number.parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
        bid: Number.parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
        timestamp: quote.data.tick.time_msc,
        timeframe: quote.timeframe,
      };
      return;
    }

    // since we already have a last tick lets compare timestamps

    if (this.$last_tick.timestamp > quote.data.tick.time_msc) {
      return;
    }

    // we have a fresh tick

    this.$last_tick = {
      symbol: quote.symbol,
      ask: Number.parseFloat(`${quote.data.tick.ask}`).toFixed(quote.info.digits),
      bid: Number.parseFloat(`${quote.data.tick.bid}`).toFixed(quote.info.digits),
      timestamp: quote.data.tick.time_msc,
      timeframe: quote.timeframe,
    };
  }

  private saveHistorical(quote: Quote) {
    if (!quote.timeframe) {
      // console.warn('historical quote has no timeframe', quote);
      return;
    }

    if (quote.timeframe !== this.timeframe) {
      return;
    }

    // if no map setup
    if (!this.$timeFramedHistorical.has(quote.timeframe)) {
      this.$timeFramedHistorical.set(quote.timeframe, new Map<string, Historical[]>());
    }

    // if no set of historicals
    if (!this.$timeFramedHistorical.get(quote.timeframe).has(quote.symbol)) {
      this.$timeFramedHistorical.get(quote.timeframe).set(quote.symbol, []);
    }

    // Normalize timestamp to milliseconds
    const timestamp = new Date(quote.data.historical.datetime).getFullYear() === 1970 ?
      quote.data.historical.datetime * 1000 :
      quote.data.historical.datetime;

    const history = this.$timeFramedHistorical.get(quote.timeframe).get(quote.symbol);

    if (history.length === 0) {
      history.push({ symbol: quote.symbol, close: quote.data.historical.close, timestamp, timeframe: quote.timeframe })
    } else {
      if (history[history.length - 1].timestamp < timestamp) {
        history.push({ symbol: quote.symbol, close: quote.data.historical.close, timestamp, timeframe: quote.timeframe });
        if (history.length > this.maxHistory) {
          history.shift();
        }
      }
    }
  }

  private populateGraphWithHistorical(timestamp: number, data: number) {
    // append to graph
    if (!this.$sparkline) {
      return;
    }

    if (this.$timeFramedHistorical.has(this.timeframe)) {
      if (this.$timeFramedHistorical.get(this.timeframe).has(this.symbol.key)) {
        const history = this.$timeFramedHistorical.get(this.timeframe).get(this.symbol.key);

        if (history[history.length - 1].timestamp < timestamp) {
          this.$sparkline.appendData(new Date(timestamp).toUTCString(), data);
        }

        if (history.length > this.maxHistory) {
          history.shift();
        }
      }
    }
  }

  private saveQuote(quote: Quote) {
    if (this.symbol.key !== quote.symbol) {
      return;
    }

    if (quote.data.tick) {
      this.saveTick(quote);
      this.saveQuotes();
      this.last_update = Date.now();
    } else if (quote.data.historical) {
      if (quote.timeframe === this.timeframe) {
        // Normalize timestamp to milliseconds
        const timestamp = new Date(quote.data.historical.datetime).getFullYear() === 1970 ?
          quote.data.historical.datetime * 1000 :
          quote.data.historical.datetime;
        this.populateGraphWithHistorical(timestamp, quote.data.historical.close);
        this.saveHistorical(quote);
        this.saveQuotes();
      }

      this.last_update = Date.now();
    } else {
      console.warn("unsupported quote");
    }
  }

  private handleData(event: [cid: string, message: ClientMessage<unknown>]) {
    this.saveQuote(event[1].get_value() as Quote);
  }

  render() {
    const classes = ["sparkline", this.display];
    return <Host>
      <rq-ws-connection connection={this.connection} onRqData={ev => this.handleData(ev.detail)} />
      <div class={classes.join(' ')}>
        <span class="symbol">{this.symbol.label}</span>
        <rq-mt-sparkline max-elements={this.maxHistory} ref={(el) => this.setRef(el)} />
      </div>
    </Host>
  }

}
