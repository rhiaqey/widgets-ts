import { Component, Element, Host, Method, Prop, Watch, h } from '@stencil/core';
import Chart from 'chart.js/auto';

@Component({
  tag: 'rq-mt-sparkline',
  styleUrl: 'rq-mt-sparkline.scss',
  shadow: true,
})
export class RqMtSparkline {

  private $instance: Chart;

  @Element()
  private hostElement: HTMLElement;

  @Prop()
  maxElements = 31;

  @Prop()
  labels: Array<string> = [];

  @Prop()
  values: Array<number> = [];

  @Watch('dataset')
  datasetChanged() {
    this.$instance.data.labels = this.labels;
    this.$instance.data.datasets = [{
      data: this.values,
      fill: true
    }];
    this.$instance.update();
  }

  @Method()
  async appendData(label: string, data: number) {
    if (this.$instance.data.labels.length > this.maxElements) {
      this.$instance.data.labels.shift();
    }

    this.$instance.data.labels.push(label);

    for (const dataset of this.$instance.data.datasets) {
      if (dataset.data.length > this.maxElements) {
        dataset.data.shift();
      }

      dataset.data.push(data);
    }

    this.$instance.update();
  }

  componentDidLoad() {
    const ctx = this.hostElement.shadowRoot.querySelector('canvas').getContext('2d');
    this.$instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.values,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: 5,
        backgroundColor: '#9c9ca2',
        plugins: {
          legend: {
            display: false
          },
        },
        elements: {
          line: {
            borderColor: '#606060',
            borderWidth: 1
          },
          point: {
            radius: 0
          }
        },
        scales: {
          x: {
            axis: 'x',
            display: false
          },
          y: {
            axis: 'y',
            display: false,
            suggestedMax: 10,
          }
        }
      }
    });
  }

  disconnectedCallback() {
    this.$instance.destroy();
  }

  render() {
    return <Host>
      <div class="chart-container" style={{ height: '30px', width: '150px' }}>
        <canvas />
      </div>
    </Host>
  }

}
