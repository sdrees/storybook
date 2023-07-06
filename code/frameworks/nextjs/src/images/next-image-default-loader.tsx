import type * as _NextImage from 'next/image';

export const defaultLoader = ({ src, width, quality }: _NextImage.ImageLoaderProps) => {
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
