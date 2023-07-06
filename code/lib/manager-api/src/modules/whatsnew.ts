import { global } from '@storybook/global';
import type { WhatsNewCache, WhatsNewData } from '@storybook/core-events';
import {
  REQUEST_WHATS_NEW_DATA,
  RESULT_WHATS_NEW_DATA,
  SET_WHATS_NEW_CACHE,
} from '@storybook/core-events';
import type { ModuleFn } from '../index';

export type SubState = {
  whatsNewData?: WhatsNewData;
};

export type SubAPI = {
  isWhatsNewUnread(): boolean;
  whatsNewHasBeenRead(): void;
};

const WHATS_NEW_NOTIFICATION_ID = 'whats-new';

export const init: ModuleFn = ({ fullAPI, store }) => {
  const state: SubState = {
    whatsNewData: undefined,
  };

  function setWhatsNewState(newState: WhatsNewData) {
    store.setState({ whatsNewData: newState });
    state.whatsNewData = newState;
  }

  const api: SubAPI = {
    isWhatsNewUnread() {
      return state.whatsNewData?.status === 'SUCCESS' && !state.whatsNewData.postIsRead;
    },
    whatsNewHasBeenRead() {
      if (state.whatsNewData?.status === 'SUCCESS') {
        setWhatsNewCache({ lastReadPost: state.whatsNewData.url });
        setWhatsNewState({ ...state.whatsNewData, postIsRead: true });
        fullAPI.clearNotification(WHATS_NEW_NOTIFICATION_ID);
      }
    },
  };

  function getLatestWhatsNewPost(): Promise<WhatsNewData> {
    fullAPI.emit(REQUEST_WHATS_NEW_DATA);

    return new Promise((resolve) =>
      fullAPI.once(RESULT_WHATS_NEW_DATA, ({ data }: { data: WhatsNewData }) => resolve(data))
    );
  }

  function setWhatsNewCache(cache: WhatsNewCache): void {
    fullAPI.emit(SET_WHATS_NEW_CACHE, cache);
  }

  const initModule = async () => {
    // The server channel doesn't exist in production, and we don't want to show what's new in production storybooks.
    if (global.CONFIG_TYPE !== 'DEVELOPMENT') return;

    const whatsNewData = await getLatestWhatsNewPost();
    setWhatsNewState(whatsNewData);

    const isNewStoryBookUser = fullAPI.getUrlState().path.includes('onboarding');

    if (
      global.FEATURES.whatsNewNotifications &&
      !isNewStoryBookUser &&
      whatsNewData.status === 'SUCCESS' &&
      whatsNewData.showNotification
    ) {
      fullAPI.addNotification({
        id: WHATS_NEW_NOTIFICATION_ID,
        link: '/settings/whats-new',
        content: {
          headline: whatsNewData.excerpt,
          subHeadline: "Click to learn what's new in Storybook",
        },
        icon: { name: 'hearthollow' },
        onClear({ dismissed }) {
          if (dismissed) setWhatsNewCache({ lastDismissedPost: whatsNewData.url });
        },
      });
    }
  };

  return { init: initModule, state, api };
};
