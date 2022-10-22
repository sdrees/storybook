import React from 'react';
import Image from 'next/image';
// eslint-disable-next-line import/extensions
import StackAlt from '../../assets/colors.svg';

const Component = () => <Image src={StackAlt} placeholder="blur" />;

export default {
  component: Component,
};

export const Default = {};
