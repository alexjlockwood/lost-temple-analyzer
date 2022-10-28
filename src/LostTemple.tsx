import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Cell from './Cell';
import styled, { css } from 'styled-components';

const roomSizeFactor = 0.7;
const doorSizeFactor = 1 - roomSizeFactor;
export const gridSize = 5;

// TODO: make this dynamic
// const minSize = 900;
export const strokeWidth = 5;

export const roomNames = ['E', 'D', 'C', 'B', 'A'].map((rowLetter) =>
  Array.from({ length: gridSize }, (_, i) => i + 1).map((colNumber) => `${rowLetter}${colNumber}`),
);

interface LostTempleProps {
  readonly size: number;
  readonly openRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
  readonly closedRooms?: ReadonlySet<string>;
  readonly closedDoors?: ReadonlySet<string>;
  readonly roomPercentMap?: ReadonlyMap<string, number>;
  readonly doorPercentMap?: ReadonlyMap<string, number>;
  readonly onRoomClick?: (roomName: string) => void;
  readonly onDoorClick?: (doorName: string) => void;
  readonly showRoomNames?: boolean;
  readonly onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  readonly onPointerMove?: React.PointerEventHandler<HTMLDivElement>;
  readonly onPointerUp?: React.PointerEventHandler<HTMLDivElement>;
}

function LostTemple({
  size,
  openRooms,
  openDoors,
  closedRooms,
  closedDoors,
  roomPercentMap,
  doorPercentMap,
  onRoomClick,
  onDoorClick,
  showRoomNames,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: LostTempleProps) {
  const roomSize = getRoomSize(size);
  const doorSize = getDoorSize(size);

  const cells = roomNames.flatMap((row, r) => {
    return row.flatMap((_, c) => {
      const roomName = getRoomName(r, c);
      const roomPercent = roomPercentMap?.get(roomName);
      const roomPercentRounded = roomPercent === undefined ? undefined : Math.round(roomPercent);
      const roomColor = getColor(openRooms, closedRooms, roomName, roomPercentRounded);
      const rowCells = [
        <Cell
          key={roomName}
          name={showRoomNames ? roomName : undefined}
          bounds={getRoomBounds(size, r, c)}
          color={roomColor}
          onClick={!isRoomA3(r, c) && onRoomClick ? () => onRoomClick(roomName) : undefined}
        />,
      ];
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        const doorPercent = doorPercentMap?.get(doorName);
        const doorPercentRounded = doorPercent === undefined ? undefined : Math.round(doorPercent);
        const doorPercentString =
          doorPercentRounded === undefined ? undefined : `${doorPercentRounded}%`;
        const doorColor = getColor(openDoors, closedDoors, doorName, doorPercentRounded);
        const doorBounds = getRightDoorBounds(size, r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          top: doorBounds.top + (roomSize - doorSize) / 2,
          bottom: doorBounds.bottom - (roomSize - doorSize) / 2,
        };
        rowCells.push(
          <Cell
            key={doorName}
            name={doorPercentString}
            bounds={updatedDoorBounds}
            color={doorColor}
            onClick={onDoorClick ? () => onDoorClick(doorName) : undefined}
          />,
        );
      }
      if (r !== gridSize - 1 && !isBottomDoorA3B3(r, c)) {
        const doorName = getBottomDoorName(r, c);
        const doorPercent = doorPercentMap?.get(doorName);
        const doorPercentRounded = doorPercent === undefined ? undefined : Math.round(doorPercent);
        const doorPercentString =
          doorPercentRounded === undefined ? undefined : `${doorPercentRounded}%`;
        const doorColor = getColor(openDoors, closedDoors, doorName, doorPercentRounded);
        const doorBounds = getBottomDoorBounds(size, r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          left: doorBounds.left + (roomSize - doorSize) / 2,
          right: doorBounds.right - (roomSize - doorSize) / 2,
        };
        rowCells.push(
          <Cell
            key={doorName}
            name={doorPercentString}
            bounds={updatedDoorBounds}
            color={doorColor}
            onClick={onDoorClick ? () => onDoorClick(doorName) : undefined}
          />,
        );
      }
      return rowCells;
    });
  });
  return (
    <Container
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      width={size}
      height={size}
    >
      {cells}
    </Container>
  );
}

const Container = styled.div<{
  readonly width: number;
  readonly height: number;
}>`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

function getColor(
  openNames: ReadonlySet<string>,
  closedNames: ReadonlySet<string> | undefined,
  name: string,
  percent: number | undefined,
): string {
  if (openNames.has(name)) {
    return getGreenColor();
  } else if (closedNames?.has(name)) {
    return getRedColor();
  } else if (percent === 100) {
    return getGreenColor(0.3);
  } else if (percent === 0) {
    return getRedColor(0.3);
  } else {
    return 'rgba(255, 255, 255, 1)';
  }
}

function getGreenColor(alpha: number = 1) {
  return `rgba(75, 231, 122, ${alpha})`;
}

function getRedColor(alpha: number = 1) {
  return `rgba(219, 54, 21, ${alpha})`;
}

export function getRoomBounds(size: number, r: number, c: number): Bounds {
  const roomOffsetX = (getRoomSize(size) + getDoorSize(size) - strokeWidth * 2) * c;
  const roomOffsetY = (getRoomSize(size) + getDoorSize(size) - strokeWidth * 2) * r;
  return {
    left: roomOffsetX,
    top: roomOffsetY,
    right: roomOffsetX + getRoomSize(size),
    bottom: roomOffsetY + getRoomSize(size),
  };
}

export function getRightDoorBounds(size: number, r: number, c: number): Bounds {
  const roomBounds = getRoomBounds(size, r, c);
  const doorOffsetX = roomBounds.left + getRoomSize(size) - strokeWidth;
  const doorOffsetY = roomBounds.top;
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + getDoorSize(size),
    bottom: doorOffsetY + getRoomSize(size),
  };
}

export function getBottomDoorBounds(size: number, r: number, c: number): Bounds {
  const roomBounds = getRoomBounds(size, r, c);
  const doorOffsetX = roomBounds.left;
  const doorOffsetY = roomBounds.top + getRoomSize(size) - strokeWidth;
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + getRoomSize(size),
    bottom: doorOffsetY + getDoorSize(size),
  };
}

function getSizePlusStrokes(size: number) {
  return size + strokeWidth * (gridSize - 1) * 2;
}

function getRoomSize(size: number) {
  return (getSizePlusStrokes(size) * roomSizeFactor) / gridSize;
}

function getDoorSize(size: number) {
  return (getSizePlusStrokes(size) * doorSizeFactor) / (gridSize - 1);
}

export function getRoomName(r: number, c: number): string {
  return roomNames[r][c];
}

export function getRightDoorName(r: number, c: number): string {
  return [getRoomName(r, c), roomNames[r][c + 1]].sort().join(',');
}

export function getBottomDoorName(r: number, c: number): string {
  return [getRoomName(r, c), roomNames[r + 1][c]].sort().join(',');
}

export function isRoomA3(r: number, c: number): boolean {
  return getRoomName(r, c) === 'A3';
}

export function isBottomDoorA3B3(r: number, c: number): boolean {
  return getBottomDoorName(r, c) === 'A3,B3';
}

export interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export default LostTemple;
