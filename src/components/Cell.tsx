import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import isEqual from 'react-fast-compare';
import { Bounds } from '../scripts/bounds';

interface Props {
  readonly name?: string;
  readonly bounds: Bounds;
  readonly color: string;
  readonly strokeWidth: number;
  readonly fontSize?: number;
  readonly onClick?: () => void;
}

function Cell({ name, bounds, color, strokeWidth, fontSize, onClick }: Props) {
  return (
    <Square bounds={bounds} strokeWidth={strokeWidth} color={color} onClick={onClick}>
      {name ? <Typography fontSize={fontSize}>{name}</Typography> : undefined}
    </Square>
  );
}

const Square = styled.div<{
  readonly bounds: Bounds;
  readonly color: string;
  readonly strokeWidth: number;
}>`
  display: grid;
  place-items: center;
  box-sizing: border-box;
  position: absolute;
  background: ${(props) => props.color};
  border: ${(props) => props.strokeWidth}px solid #333;
  text-align: center;
  left: ${(props) => props.bounds.left}px;
  top: ${(props) => props.bounds.top}px;
  width: ${(props) => props.bounds.right - props.bounds.left}px;
  height: ${(props) => props.bounds.bottom - props.bounds.top}px;
`;

export default React.memo(Cell, isEqual);
