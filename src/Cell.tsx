import React from 'react';
import './App.css';
import styled, { css } from 'styled-components';
import { Bounds, strokeWidth } from './LostTemple';

interface Props {
  readonly name?: string;
  readonly bounds: Bounds;
  readonly color: string;
  readonly onClick?: () => void;
}

function Cell({ name, bounds, color, onClick }: Props) {
  return (
    <Square bounds={bounds} strokeWidth={strokeWidth} color={color} onClick={onClick}>
      {name ? name : undefined}
    </Square>
  );
}

const Square = styled.div<{
  readonly bounds: Bounds;
  readonly color: string;
  readonly strokeWidth: number;
}>`
  box-sizing: border-box;
  position: absolute;
  background: ${(props) => props.color};
  border: ${(props) => props.strokeWidth}px solid #000;
  text-align: center;
  left: ${(props) => props.bounds.left}px;
  top: ${(props) => props.bounds.top}px;
  width: ${(props) => props.bounds.right - props.bounds.left}px;
  height: ${(props) => props.bounds.bottom - props.bounds.top}px;
  user-select: none;
`;

export default Cell;
