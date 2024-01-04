import { dashToCamelCase, dashToPascalCase } from "./utils/string-utils";
import type {
  Config,
  OutputTargetDistCustomElements,
  BuildCtx,
  CompilerCtx,
} from "@stencil/core/internal";

interface ReactOutputTargetOptions {
  /**
   * The path to the output file. The path is relative to the root of the Stencil project.
   */
  outputPath: string;
}

export const reactOutputTarget = ({ outputPath }: ReactOutputTargetOptions) => {
  let customElementsDir = "dist/components";

  let stencilPackageName: string;

  return {
    type: "custom",
    name: "react-output-target",
    validate(config: Config) {
      const customElementsOutputTarget = (config.outputTargets || []).find(
        (o) => o.type === "dist-custom-elements",
      ) as OutputTargetDistCustomElements;
      if (customElementsOutputTarget == null) {
        throw new Error(
          `The 'react-output-target' requires 'dist-custom-elements' output target. Add { type: 'dist-custom-elements' }, to the outputTargets config.`,
        );
      }
      if (customElementsOutputTarget.dir !== undefined) {
        /**
         * If the developer has configured a custom output path for the Stencil components,
         * we need to use that path when importing the components in the React components.
         */
        customElementsDir = customElementsOutputTarget.dir;
      }

      if (config.sys && config.packageJsonFilePath) {
        const { name: packageName } = JSON.parse(
          config.sys.readFileSync(config.packageJsonFilePath, "utf8"),
        );
        stencilPackageName = packageName;
      }

      if (!stencilPackageName) {
        throw new Error(
          "Unable to find the package name in the package.json file: " +
            config.packageJsonFilePath,
        );
      }
    },
    async generator(
      _config: Config,
      compilerCtx: CompilerCtx,
      buildCtx: BuildCtx,
    ) {
      const components = buildCtx.components;

      const componentWrappers: string[] = [];
      const imports: string[] = [
        `import React from 'react';`,
        `import { createComponent as createComponentWrapper, Options } from '@lit/react';`,
      ];

      for (const component of components) {
        const tagName = component.tagName;
        // tagName to pascal case, remove the dash
        const reactTagName = dashToPascalCase(tagName);

        const events = (component.events || [])
          .filter((e) => e.internal === false)
          .map((e) => ({
            [dashToCamelCase(`on-${e.name}`)]: e.name,
          }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {});

        const defineCustomElementFn = `define${reactTagName}`;

        imports.push(
          `import { ${reactTagName} as ${reactTagName}Element, defineCustomElement as ${defineCustomElementFn} } from '${stencilPackageName}/${customElementsDir}/${tagName}.js';`,
        );

        componentWrappers.push(`export const ${reactTagName} = createComponent({
  tagName: '${tagName}',
  elementClass: ${reactTagName}Element,
  react: React,
  events: ${JSON.stringify(events, null, 2)},
  defineCustomElement: ${defineCustomElementFn}
});`);
      }

      const finalText = `
${imports.join("\n")}

const createComponent = <T extends HTMLElement>({ defineCustomElement, ...options }: Options<T> & { defineCustomElement: () => void }) => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  return createComponentWrapper<T>(options);
};

${componentWrappers.join("\n")}
      `;

      await compilerCtx.fs.writeFile(outputPath, finalText);
    },
  };
};
