import { newE2EPage } from '@stencil/core/testing';

describe('rq-single-quote', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<rq-single-quote></rq-single-quote>');

    const element = await page.find('rq-single-quote');
    expect(element).toHaveClass('hydrated');
  });
});
