<p align="center">
  <a href="#">
    <img alt="Stencil React Output Target" src="https://github.com/stencil-community/stencil-react-output-target/blob/main/.github/logo.png?raw=true" width="84" />
  </a>
</p>

<h1 align="center">
  Stencil React Output Target
</h1>

<p align="center">

While Web Components can be used in React, they don't always integrate smoothly due to React's synthetic event system and handling of properties vs. attributes. The React output target helps bridge these gaps by creating a React component wrapper for each custom element, allowing you to use the custom element in React as if it were a native React component.

This package makes use of the [`@lit/react`](https://www.npmjs.com/package/@lit/react) package to streamline the process, making it easier than ever to create Stencil components that integrate seamlessly with React applications.

</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Stencil React Output Target is released under the MIT license." />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
</p>

♾️ **Interoperability**: Enables seamless integration of Stencil components in React applications.

📦 **Consistency**: Provides a consistent developer experience for teams working with both Stencil and React.

♻️ **Reusability**: Write once in Stencil, and use across different frameworks.

## Installation

```bash
npm install @stencil-community/react-output-target --save-dev
```

## Usage

### Add the output target to your Stencil config

```ts
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil-community/react-output-target';

export const config: Config = {
  namespace: 'mycomponentlibrary',
  outputTargets: [
    {
      type: 'dist-custom-elements',
    },
    reactOutputTarget({
      outputPath: '../react-demo/src/components/react-components.ts',
    }),
  ],
};
```

> The react output target requires the `dist-custom-elements` output target to be configured as well. This is required to generate tree-shakable components.

### Install the `@lit/react` package in your React app or library

The generated React components depend on the `@lit/react` package.

```bash
npm install @lit/react --save
```

### Install the Stencil library in your React app or library

The React application should have a dependency to your Stencil library. This can be done with a variety approaches, including installing the npm package from the registry, symbolic linking, or using a tool like pnpm workspaces.

### Use the React components in your React app or library

```tsx
import { MyComponent } from './components/react-components';

export const App = () => {
  return (
    <div>
      <MyComponent
        first="Stencil"
        last="'Don't call me a framework' JS"
      ></MyComponent>
    </div>
  );
};
```
