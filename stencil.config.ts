import type { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'widgets-ts',
  buildDist: true,
  sourceMap: false,
  plugins: [
    sass()
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'stats',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {
          src: 'assets',
          dest: 'assets'
        },
        {
          src: 'assets',
          dest: 'build/assets'
        },
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
  },
};
