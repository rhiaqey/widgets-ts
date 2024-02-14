import { newSpecPage } from '@stencil/core/testing';
import { WelcomeChaos } from './welcome-chaos';

describe('welcome-chaos', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [WelcomeChaos],
      html: `<welcome-chaos></welcome-chaos>`,
    });
    expect(page.root).toEqualHtml(`
      <welcome-chaos>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </welcome-chaos>
    `);
  });
});
