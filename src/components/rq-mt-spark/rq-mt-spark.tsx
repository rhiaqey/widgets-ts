import { Component, Host, Prop, h } from '@stencil/core';
import type { RqMtSparkline } from '../rq-mt-sparkline/rq-mt-sparkline';
import type { TradeSymbol } from '../../models';

@Component({
  tag: 'rq-mt-spark',
  styleUrl: 'rq-mt-spark.scss',
  shadow: true,
})
export class RqMtSpark {

  private sparkline!: RqMtSparkline;

  @Prop()
  symbol: TradeSymbol;

  @Prop()
  maxHistory = 30;

  @Prop()
  namespace = "rq-mt-spark";

  setRef(el) {
    this.sparkline = el as RqMtSparkline;
  }

  componentDidLoad() {
    const min = 1;
    const max = 1500;
    this.sparkline.appendData(new Date().toUTCString(), Math.floor(Math.random() * (max - min + 1) + min));
    setInterval(() => {
      this.sparkline.appendData(new Date().toUTCString(), Math.floor(Math.random() * (max - min + 1) + min));
    }, 1000);
  }

  render() {
    return <Host>
      <div class="sparkline">
        <span class="symbol">{this.symbol.label}</span>
        <rq-mt-sparkline max-elements="20" ref={(el) => this.setRef(el)} />
      </div>
    </Host>
  }

}
