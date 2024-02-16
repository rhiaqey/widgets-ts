import { newSpecPage } from '@stencil/core/testing';
import { RqSingleQuote } from '../rq-single-quote';

describe('rq-single-quote', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [RqSingleQuote],
      html: `<rq-single-quote></rq-single-quote>`,
    });
    expect(page.root).toEqualHtml(`
      <rq-single-quote>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </rq-single-quote>
    `);
  });
});
