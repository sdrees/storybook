import React from 'react';
import type * as _NextImage from 'next/image';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore import is aliased in webpack config
import OriginalNextFutureImage from 'sb-original/next/future/image';
import { ImageContext } from './context';
import { defaultLoader } from './next-image-default-loader';

function NextFutureImage(props: _NextImage.ImageProps) {
  const imageParameters = React.useContext(ImageContext);

  return (
    <OriginalNextFutureImage
      {...imageParameters}
      {...props}
      loader={props.loader ?? defaultLoader}
    />
  );
}

export default NextFutureImage;
