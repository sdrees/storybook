// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore import is aliased in webpack config
import OriginalNextLegacyImage from 'sb-original/next/legacy/image';
import type * as _NextLegacyImage from 'next/legacy/image';
import React from 'react';
import { ImageContext } from './context';
import { defaultLoader } from './next-image-default-loader';

function NextLegacyImage(props: _NextLegacyImage.ImageProps) {
  const imageParameters = React.useContext(ImageContext);

  return (
    <OriginalNextLegacyImage
      {...imageParameters}
      {...props}
      loader={props.loader ?? defaultLoader}
    />
  );
}

export default NextLegacyImage;
