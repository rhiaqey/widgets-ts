import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'rq-mt-rates',
  styleUrl: 'rq-mt-rates.css',
  shadow: true,
})
export class RqMtRates {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
