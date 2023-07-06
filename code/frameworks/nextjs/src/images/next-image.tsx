// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore import is aliased in webpack config
import OriginalNextImage from 'sb-original/next/image';
import type * as _NextImage from 'next/image';
import React from 'react';
import { ImageContext } from './context';
import { defaultLoader } from './next-image-default-loader';

const MockedNextImage = (props: _NextImage.ImageProps) => {
  const imageParameters = React.useContext(ImageContext);

  return (
    <OriginalNextImage {...imageParameters} {...props} loader={props.loader ?? defaultLoader} />
  );
};

export default MockedNextImage;
