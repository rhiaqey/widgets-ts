import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'welcome-chaos',
  styleUrl: 'welcome-chaos.css',
  shadow: true,
})
export class WelcomeChaos {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
