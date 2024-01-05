import { describe, it, expect } from 'vitest';
import { createComponentWrappers } from './create-component-wrappers';
import { BuildCtx } from '@stencil/core/internal';
import { dedent } from 'ts-dedent';

describe('createComponentWrappers', () => {
  it('should generate a react component wrapper', async () => {
    const buildCtx = {
      components: [
        {
          tagName: 'my-component',
          componentClassName: 'MyComponent',
          events: [
            {
              originalName: 'my-event',
              name: 'myEvent',
              type: 'CustomEvent',
            },
          ],
        },
      ],
    } as unknown as BuildCtx;

    const sourceFile = createComponentWrappers({
      buildCtx,
      stencilPackageName: 'my-package',
      customElementsDir: 'dist/custom-elements',
      outputPath: 'my-output-path.tsx',
    });

    expect(sourceFile.getFullText()).toEqual(dedent`
import type { EventName } from '@lit/react';
import { createComponent as createComponentWrapper, Options } from '@lit/react';
import { defineCustomElement as defineMyComponent, MyComponent as MyComponentElement } from "my-package/dist/custom-elements/my-component.js";
import React from 'react';

const createComponent = <T extends HTMLElement, E extends Record<string, EventName | string>>({ defineCustomElement, ...options }: Options<T, E> & { defineCustomElement: () => void }) => {
    if (typeof defineCustomElement !== 'undefined') {
        defineCustomElement();
    }
    return createComponentWrapper<T, E>(options);
};

type MyComponentEvents = NonNullable<unknown>;

export const MyComponent = createComponent<MyComponentElement, MyComponentEvents>({
    tagName: 'my-component',
    elementClass: MyComponentElement,
    react: React,
    events: {} as MyComponentEvents,
    defineCustomElement: defineMyComponent
});

`);
  });
});
