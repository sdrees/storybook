import { useStorybookApi } from '@storybook/api';
import type { FC } from 'react';
import React, { useEffect } from 'react';

import { ReleaseNotesScreen } from './release_notes';

const ReleaseNotesPage: FC = () => {
  const api = useStorybookApi();

  useEffect(() => {
    api.setDidViewReleaseNotes();
  }, []);

  const version = api.releaseNotesVersion();

  return <ReleaseNotesScreen version={version} />;
};

export { ReleaseNotesPage };
