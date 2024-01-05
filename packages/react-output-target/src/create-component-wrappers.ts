import { Project, VariableDeclarationKind } from 'ts-morph';
import { kebabToPascalCase, eventListenerName } from './utils/string-utils';
import type { BuildCtx } from '@stencil/core/internal';

interface ReactEvent {
  originalName: string;
  name: string;
  type: string;
}

export const createComponentWrappers = ({
  stencilPackageName,
  buildCtx,
  outputPath,
  customElementsDir,
}: {
  stencilPackageName: string;
  buildCtx: BuildCtx;
  customElementsDir: string;
  outputPath: string;
}) => {
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
    const reactTagName = kebabToPascalCase(tagName);
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
          name: 'defineCustomElement',
          alias: `define${reactTagName}`,
        },
      ],
    });

    const publicEvents = (component.events || []).filter(
      (e) => e.internal === false,
    );

    const events: ReactEvent[] = [];

    for (const event of publicEvents) {
      const hasComplexType = Object.keys(event.complexType.references).includes(
        event.complexType.resolved,
      );

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
          ? `{ ${events.map((e) => `${e.name}: ${e.type}`).join(',\n')} }`
          : 'NonNullable<unknown>',
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
            .join(',\n')}} as ${componentEventNamesType},
          defineCustomElement: define${reactTagName}
        })`,
        },
      ],
    });

    statement.setIsExported(true);
  }

  sourceFile.organizeImports();
  sourceFile.formatText();

  return sourceFile;
};
