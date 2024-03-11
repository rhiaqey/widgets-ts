import { Component, Host, Prop, h } from '@stencil/core';
import type { RqMtSparkline } from '../rq-mt-sparkline/rq-mt-sparkline';
import type { TradeSymbol as BaseTradeSymbol } from '../../models';
import type { ClientMessage, WebsocketConnection, WebsocketConnectionOptions } from '@rhiaqey/sdk-ts';

type TradeSymbol = Omit<BaseTradeSymbol, 'image'>;

@Component({
  tag: 'rq-mt-spark',
  styleUrl: 'rq-mt-spark.scss',
  shadow: true,
})
export class RqMtSpark {

  private $sparkline!: RqMtSparkline;

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

  setRef(el) {
    this.$sparkline = el as RqMtSparkline;
  }

  componentDidLoad() {
    const min = 1;
    const max = 1500;
    this.$sparkline.appendData(new Date().toUTCString(), Math.floor(Math.random() * (max - min + 1) + min));
    setInterval(() => {
      this.$sparkline.appendData(new Date().toUTCString(), Math.floor(Math.random() * (max - min + 1) + min));
    }, 1000);
  }

  private handleData(_event: [cid: string, message: ClientMessage<unknown>]) {
//     this.saveQuote(event[1].get_value() as Quote);
  }

  render() {
    const classes = ["sparkline", this.display];
    return <Host>
      <rq-ws-connection connection={this.connection} onRqData={ev => this.handleData(ev.detail)} />
      <div class={classes.join(' ')}>
        <span class="symbol">{this.symbol.label}</span>
        <rq-mt-sparkline max-elements="20" ref={(el) => this.setRef(el)} />
      </div>
    </Host>
  }

}
