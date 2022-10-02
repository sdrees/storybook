/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Box = styled.div`
  background-color: ${(props) => props.bg};
`;

Box.propTypes = {
  bg: PropTypes.string,
};

export const MyBox = (props) => <Box {...props} />;

MyBox.propTypes = {
  bg: PropTypes.string,
};

export const component = MyBox;
