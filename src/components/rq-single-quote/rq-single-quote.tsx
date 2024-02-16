import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'rq-single-quote',
  styleUrl: 'rq-single-quote.css',
  shadow: true,
})
export class RqSingleQuote {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
