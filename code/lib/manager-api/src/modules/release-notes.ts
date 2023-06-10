import { global } from '@storybook/global';
import type { API_ReleaseNotes } from '@storybook/types';
import memoize from 'memoizerific';

import type { ModuleFn } from '../index';

const { RELEASE_NOTES_DATA } = global;

const getReleaseNotesData = memoize(1)((): API_ReleaseNotes => {
  try {
    return { ...(JSON.parse(RELEASE_NOTES_DATA) || {}) };
  } catch (e) {
    return {};
  }
});

export interface SubAPI {
  /**
   * Returns the current version of the release notes.
   * @returns {string} The current version of the release notes.
   */
  releaseNotesVersion: () => string;
  /**
   * Sets the release notes as viewed.
   * @returns {void}
   */
  setDidViewReleaseNotes: () => void;
  /**
   * Determines whether to show the release notes on launch.
   * @returns {boolean} Whether to show the release notes on launch.
   */
  showReleaseNotesOnLaunch: () => boolean;
}

export interface SubState {
  releaseNotesViewed: string[];
}

export const init: ModuleFn<SubAPI, SubState> = ({ store }) => {
  const releaseNotesData = getReleaseNotesData();
  const getReleaseNotesViewed = () => {
    const { releaseNotesViewed: persistedReleaseNotesViewed } = store.getState();
    return persistedReleaseNotesViewed || [];
  };

  const api: SubAPI = {
    releaseNotesVersion: () => releaseNotesData.currentVersion,
    setDidViewReleaseNotes: () => {
      const releaseNotesViewed = getReleaseNotesViewed();

      if (!releaseNotesViewed.includes(releaseNotesData.currentVersion)) {
        store.setState(
          { releaseNotesViewed: [...releaseNotesViewed, releaseNotesData.currentVersion] },
          { persistence: 'permanent' }
        );
      }
    },
    showReleaseNotesOnLaunch: () => {
      // The currentVersion will only exist for dev builds
      if (!releaseNotesData.currentVersion) return false;
      const releaseNotesViewed = getReleaseNotesViewed();
      const didViewReleaseNotes = releaseNotesViewed.includes(releaseNotesData.currentVersion);
      const showReleaseNotesOnLaunch = releaseNotesData.showOnFirstLaunch && !didViewReleaseNotes;
      return showReleaseNotesOnLaunch;
    },
  };

  return { state: { releaseNotesViewed: [] }, api };
};
