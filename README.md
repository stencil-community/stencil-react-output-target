<p align="center">
  <a href="#">
    <img alt="Stencil React Output Target" src="https://github.com/sean-perkins/stencil-react-output-target/blob/main/.github/logo.png?raw=true" width="84" />
  </a>
</p>

<h1 align="center">
  Stencil React Output Target
</h1>

<p align="center">

The Stencil React Output Target simplifies the process for Stencil web component library creators by automatically generating React component wrappers for Stencil components. With this package, Stencil component authors can ensure type safety, while also enjoying the familiarity of React-style syntax for their components and APIs. This solution leverages the [`@lit/react`](https://www.npmjs.com/package/@lit/react) package to streamline the process, making it easier than ever to create Stencil components that integrate seamlessly with React applications.

</p>

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
