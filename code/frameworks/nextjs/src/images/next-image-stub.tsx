/* eslint-disable no-underscore-dangle, @typescript-eslint/no-non-null-assertion */
import * as React from 'react';
import type * as _NextImage from 'next/image';
import type * as _NextLegacyImage from 'next/legacy/image';
import semver from 'semver';

const defaultLoader = ({ src, width, quality }: _NextImage.ImageLoaderProps) => {
  const missingValues = [];
  if (!src) {
    missingValues.push('src');
  }

  if (!width) {
    missingValues.push('width');
  }

  if (missingValues.length > 0) {
    throw new Error(
      `Next Image Optimization requires ${missingValues.join(
        ', '
      )} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify(
        {
          src,
          width,
          quality,
        }
      )}`
    );
  }

  return `${src}?w=${width}&q=${quality ?? 75}`;
};

const NextImage = require('next/image') as typeof _NextImage;

const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props: _NextImage.ImageProps) => {
    return <OriginalNextImage {...props} loader={props.loader ?? defaultLoader} />;
  },
});

if (semver.satisfies(process.env.__NEXT_VERSION!, '^13.0.0')) {
  const LegacyNextImage = require('next/legacy/image') as typeof _NextLegacyImage;
  const OriginalNextLegacyImage = LegacyNextImage.default;

  Object.defineProperty(OriginalNextLegacyImage, 'default', {
    configurable: true,
    value: (props: _NextLegacyImage.ImageProps) => (
      <OriginalNextLegacyImage {...props} loader={props.loader ?? defaultLoader} />
    ),
  });
}

if (semver.satisfies(process.env.__NEXT_VERSION!, '^12.2.0')) {
  const NextFutureImage = require('next/future/image') as typeof _NextImage;
  const OriginalNextFutureImage = NextFutureImage.default;

  Object.defineProperty(OriginalNextFutureImage, 'default', {
    configurable: true,
    value: (props: _NextImage.ImageProps) => (
      <OriginalNextFutureImage {...props} loader={props.loader ?? defaultLoader} />
    ),
  });
}
