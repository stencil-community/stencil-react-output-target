# Stencil React Output Target

The Stencil React output target is a [Stencil](https://stenciljs.com) output target to generate React component wrappers. This packages makes use of the [`@lit/react`](https://www.npmjs.com/package/@lit/react) package to generate the React components from your Stencil components.

## Installation

```bash
npm install @stencil-community/react-output-target --save-dev
```

## Usage

### Add the output target to your Stencil config

```ts
import { Config } from "@stencil/core";
import { reactOutputTarget } from "@stencil/react-output-target";

export const config: Config = {
  namespace: "mycomponent",
  outputTargets: [
    {
      type: "dist-custom-elements",
    },
    reactOutputTarget({
      outputPath: "../react-demo/src/components/react-components.ts",
    }),
  ],
};
```

> The react output target requires the `dist-custom-elements` output target to be configured as well. This is required to generate tree-shakable components.

### Install the `@lit/react` package in your React app

```bash
npm install @lit/react --save
```

### Install the Stencil library in your React app

The React application should have a dependency to your Stencil library. This can be done by installing the npm package of your Stencil library from the registry or using symlink.

### Use the React components in your React app

```tsx
import { MyComponent } from "./components/react-components";

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
