import { newE2EPage } from '@stencil/core/testing';

describe('welcome-chaos', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<welcome-chaos></welcome-chaos>');

    const element = await page.find('welcome-chaos');
    expect(element).toHaveClass('hydrated');
  });
});
