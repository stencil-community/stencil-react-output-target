import type {
  Config,
  OutputTargetDistCustomElements,
  BuildCtx,
  CompilerCtx,
  OutputTargetCustom,
} from '@stencil/core/internal';
import { createComponentWrappers } from './create-component-wrappers';

export interface ReactOutputTargetOptions {
  /**
   * The path to the output file. The path is relative to the root of the Stencil project.
   */
  outputPath: string;
}

export const reactOutputTarget = ({
  outputPath,
}: ReactOutputTargetOptions): OutputTargetCustom => {
  let customElementsDir = 'dist/components';

  let stencilPackageName: string;

  return {
    type: 'custom',
    name: 'react-output-target',
    validate(config: Config) {
      if (!outputPath.endsWith('.ts') && !outputPath.endsWith('.tsx')) {
        throw new Error(
          `The 'react-output-target' currently only supports .ts and .tsx output files. Please change the 'outputPath' config to end with .ts or .tsx.`,
        );
      }

      const customElementsOutputTarget = (config.outputTargets || []).find(
        (o) => o.type === 'dist-custom-elements',
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
          config.sys.readFileSync(config.packageJsonFilePath, 'utf8'),
        );
        stencilPackageName = packageName;
      }

      if (!stencilPackageName) {
        throw new Error(
          'Unable to find the package name in the package.json file: ' +
            config.packageJsonFilePath,
        );
      }
    },
    async generator(
      _config: Config,
      compilerCtx: CompilerCtx,
      buildCtx: BuildCtx,
    ) {
      const sourceFile = createComponentWrappers({
        outputPath,
        buildCtx,
        stencilPackageName,
        customElementsDir,
      });

      sourceFile.save();

      await compilerCtx.fs.writeFile(outputPath, sourceFile.getFullText());
    },
  };
};
