import { global } from '@storybook/global';

import type { Channel } from '@storybook/channels';
import type { AddonStore } from '@storybook/manager-api';
import { addons } from '@storybook/manager-api';
import type { Addon_Types, Addon_Config } from '@storybook/types';
import { createBrowserChannel } from '@storybook/channels';
import { CHANNEL_CREATED } from '@storybook/core-events';
import Provider from './provider';
import { renderStorybookUI } from './index';

const { CONFIG_TYPE } = global;

class ReactProvider extends Provider {
  private addons: AddonStore;

  private channel: Channel;

  /**
   * @deprecated will be removed in 8.0, please use channel instead
   */
  private serverChannel?: Channel;

  constructor() {
    super();

    const channel = createBrowserChannel({ page: 'manager' });

    addons.setChannel(channel);

    channel.emit(CHANNEL_CREATED);

    this.addons = addons;
    this.channel = channel;
    global.__STORYBOOK_ADDONS_CHANNEL__ = channel;

    if (CONFIG_TYPE === 'DEVELOPMENT') {
      this.serverChannel = this.channel;
      addons.setServerChannel(this.serverChannel);
    }
  }

  getElements(type: Addon_Types) {
    return this.addons.getElements(type);
  }

  getConfig(): Addon_Config {
    return this.addons.getConfig();
  }

  handleAPI(api: unknown) {
    this.addons.loadAddons(api);
  }
}

const { document } = global;
const rootEl = document.getElementById('root');
renderStorybookUI(rootEl, new ReactProvider());
