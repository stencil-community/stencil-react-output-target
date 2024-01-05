import { describe, it, expect } from 'vitest';
import { reactOutputTarget } from '.';

describe('reactOutputTarget', () => {
  it('should throw an error if the output path does not end with .ts or .tsx', () => {
    const { validate } = reactOutputTarget({
      outputPath: 'my-output-path.js',
    });

    if (validate) {
      expect(() => validate({} as any, [])).toThrowError(
        `The 'react-output-target' currently only supports .ts and .tsx output files. Please change the 'outputPath' config to end with .ts or .tsx.`,
      );
    }
  });

  it('should throw an error if the output target dist-custom-elements is not configured', () => {
    const { validate } = reactOutputTarget({
      outputPath: 'my-output-path.tsx',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [],
          } as any,
          [],
        ),
      ).toThrowError(
        `The 'react-output-target' requires 'dist-custom-elements' output target. Add { type: 'dist-custom-elements' }, to the outputTargets config.`,
      );
    }
  });

  it('should throw an error if the package.json file cannot be found', () => {
    const { validate } = reactOutputTarget({
      outputPath: 'my-output-path.tsx',
    });

    if (validate) {
      expect(() =>
        validate(
          {
            outputTargets: [
              {
                type: 'dist-custom-elements',
              },
            ],
          } as any,
          [],
        ),
      ).toThrowError(
        'Unable to find the package name in the package.json file: undefined',
      );
    }
  });
});
