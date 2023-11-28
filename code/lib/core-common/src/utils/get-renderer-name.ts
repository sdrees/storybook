import type { Options } from '@storybook/types';
import { getFrameworkName } from './get-framework-name';

/**
 * Render is set as a string on core. It must be set by the framework
 */
export async function getRendererName(options: Options) {
  const core = await options.presets.apply('core', {}, options);

  if (!core || !core.renderer) {
    // At the moment some frameworks (Angular/Ember) do not define a renderer, but themselves
    // serve the purpose (in particular exporting the symbols needed by entrypoints)
    return getFrameworkName(options);
  }

  return core.renderer;
}
