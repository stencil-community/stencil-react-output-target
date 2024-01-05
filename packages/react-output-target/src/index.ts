import { dashToPascalCase, eventListenerName } from "./utils/string-utils";
import type {
  Config,
  OutputTargetDistCustomElements,
  BuildCtx,
  CompilerCtx,
} from "@stencil/core/internal";
import { Project, VariableDeclarationKind } from "ts-morph";

export interface ReactOutputTargetOptions {
  /**
   * The path to the output file. The path is relative to the root of the Stencil project.
   */
  outputPath: string;
}

interface ReactEvent {
  originalName: string;
  name: string;
  type: string;
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

      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile(
        outputPath,
        `import type {EventName} from '@lit/react';
import React from 'react';
import { createComponent as createComponentWrapper, Options } from '@lit/react';

const createComponent = <T extends HTMLElement, E extends Record<string, EventName | string>>({ defineCustomElement, ...options }: Options<T, E> & { defineCustomElement: () => void }) => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  return createComponentWrapper<T, E>(options);
};`,
      );

      for (const component of components) {
        const tagName = component.tagName;
        const reactTagName = dashToPascalCase(tagName);
        const componentElement = `${reactTagName}Element`;
        const componentCustomEvent = `${reactTagName}CustomEvent`;

        sourceFile.addImportDeclaration({
          moduleSpecifier: `${stencilPackageName}/${customElementsDir}/${tagName}.js`,
          namedImports: [
            {
              name: reactTagName,
              alias: `${reactTagName}Element`,
            },
            {
              name: "defineCustomElement",
              alias: `define${reactTagName}`,
            },
          ],
        });

        const publicEvents = (component.events || []).filter(
          (e) => e.internal === false,
        );

        const events: ReactEvent[] = [];

        for (const event of publicEvents) {
          const hasComplexType = Object.keys(
            event.complexType.references,
          ).includes(event.complexType.resolved);

          if (hasComplexType) {
            sourceFile.addImportDeclaration({
              moduleSpecifier: stencilPackageName,
              namedImports: [
                {
                  name: event.complexType.resolved,
                  isTypeOnly: true,
                },
              ],
            });
            sourceFile.addImportDeclaration({
              moduleSpecifier: stencilPackageName,
              namedImports: [
                {
                  name: componentCustomEvent,
                  isTypeOnly: true,
                },
              ],
            });

            events.push({
              originalName: event.name,
              name: eventListenerName(event.name),
              type: `EventName<${componentCustomEvent}<${event.complexType.resolved}>>`,
            });
          } else {
            events.push({
              originalName: event.name,
              name: eventListenerName(event.name),
              type: `EventName<CustomEvent<${event.complexType.resolved}>>`,
            });
          }
        }

        const componentEventNamesType = `${reactTagName}Events`;

        sourceFile.addTypeAlias({
          name: componentEventNamesType,
          type:
            events.length > 0
              ? `{ ${events.map((e) => `${e.name}: ${e.type}`).join(",\n")} }`
              : "NonNullable<unknown>",
        });

        const statement = sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: reactTagName,
              initializer: `createComponent<${componentElement}, ${componentEventNamesType}>({
              tagName: '${tagName}',
              elementClass: ${componentElement},
              react: React,
              events: { ${events
                .map((e) => `${e.name}: '${e.originalName}'`)
                .join(",\n")}} as ${componentEventNamesType},
              defineCustomElement: define${reactTagName}
            })`,
            },
          ],
        });

        statement.setIsExported(true);
      }

      sourceFile.organizeImports();
      sourceFile.formatText();
      sourceFile.save();

      await compilerCtx.fs.writeFile(outputPath, sourceFile.getFullText());
    },
  };
};
