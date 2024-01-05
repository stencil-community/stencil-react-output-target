import { Config } from '@stencil/core';

import { reactOutputTarget } from '@stencil-community/react-output-target';

export const config: Config = {
  namespace: 'stencil-demo',
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
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    reactOutputTarget({
      outputPath: '../react-demo/src/components/react-components.ts',
    }),
  ],
  testing: {
    browserHeadless: 'new',
  },
};
