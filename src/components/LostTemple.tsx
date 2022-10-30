import React from 'react';
import Cell from './Cell';
import styled from '@emotion/styled';
import {
  getBottomDoorName,
  getRightDoorName,
  getRoomName,
  gridSize,
  isBottomDoorA3B3,
  isRoomA3,
} from '../scripts/lostTempleUtils';

const roomSizeFactor = 0.7;
const doorSizeFactor = 1 - roomSizeFactor;

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
  const roomFontSize = getRoomFontSize(size);
  const doorFontSize = getDoorFontSize(size);

  // TODO: sort these so that doors are at the bottom of z-index? some glitches otherwise...
  const cells: JSX.Element[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        const doorPercent = doorPercentMap?.get(doorName);
        const doorPercentRounded = doorPercent === undefined ? undefined : Math.round(doorPercent);
        const doorPercentString =
          doorPercentRounded === undefined ? undefined : `${doorPercentRounded}%`;
        const doorColor = getColor(openDoors, closedDoors, doorName, doorPercent);
        const doorBounds = getRightDoorBounds(size, r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          top: doorBounds.top + (roomSize - doorSize) / 2,
          bottom: doorBounds.bottom - (roomSize - doorSize) / 2,
        };
        cells.push(
          <Cell
            key={doorName}
            name={
              doorPercentRounded === 0 || doorPercentRounded === 100 ? undefined : doorPercentString
            }
            bounds={updatedDoorBounds}
            color={doorColor}
            strokeWidth={getStrokeWidth(size)}
            fontSize={doorFontSize}
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
        const doorColor = getColor(openDoors, closedDoors, doorName, doorPercent);
        const doorBounds = getBottomDoorBounds(size, r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          left: doorBounds.left + (roomSize - doorSize) / 2,
          right: doorBounds.right - (roomSize - doorSize) / 2,
        };
        cells.push(
          <Cell
            key={doorName}
            name={
              doorPercentRounded === 0 || doorPercentRounded === 100 ? undefined : doorPercentString
            }
            bounds={updatedDoorBounds}
            color={doorColor}
            strokeWidth={getStrokeWidth(size)}
            fontSize={doorFontSize}
            onClick={onDoorClick ? () => onDoorClick(doorName) : undefined}
          />,
        );
      }
    }
  }

  // Place the rooms after the doors.
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const roomName = getRoomName(r, c);
      const roomPercent = roomPercentMap?.get(roomName);
      const roomColor = getColor(openRooms, closedRooms, roomName, roomPercent);
      cells.push(
        <Cell
          key={roomName}
          name={showRoomNames ? roomName : undefined}
          bounds={getRoomBounds(size, r, c)}
          color={roomColor}
          strokeWidth={getStrokeWidth(size)}
          fontSize={roomFontSize}
          onClick={!isRoomA3(r, c) && onRoomClick ? () => onRoomClick(roomName) : undefined}
        />,
      );
    }
  }
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
  position: relative;
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
    return getGreenColor(true);
  } else if (percent === 0) {
    return getRedColor(true);
  } else {
    return 'rgba(255, 255, 255, 1)';
  }
}

function getGreenColor(isLight: boolean = false) {
  return isLight ? '#daf7dc' : `rgba(75, 231, 122)`;
}

function getRedColor(isLight: boolean = false) {
  return isLight ? '#efc7be' : `rgba(219, 54, 21)`;
}

export function getRoomBounds(size: number, r: number, c: number): Bounds {
  const roomOffsetX = (getRoomSize(size) + getDoorSize(size) - getStrokeWidth(size) * 2) * c;
  const roomOffsetY = (getRoomSize(size) + getDoorSize(size) - getStrokeWidth(size) * 2) * r;
  return {
    left: roomOffsetX,
    top: roomOffsetY,
    right: roomOffsetX + getRoomSize(size),
    bottom: roomOffsetY + getRoomSize(size),
  };
}

export function getRightDoorBounds(size: number, r: number, c: number): Bounds {
  const roomBounds = getRoomBounds(size, r, c);
  const doorOffsetX = roomBounds.left + getRoomSize(size) - getStrokeWidth(size);
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
  const doorOffsetY = roomBounds.top + getRoomSize(size) - getStrokeWidth(size);
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + getRoomSize(size),
    bottom: doorOffsetY + getDoorSize(size),
  };
}

export interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

function getRoomFontSize(size: number): number {
  if (size <= 400) {
    return 14;
  } else if (size <= 600) {
    return 18;
  } else {
    return 32;
  }
}

function getDoorFontSize(size: number): number {
  if (size <= 400) {
    return 10;
  } else if (size <= 600) {
    return 12;
  } else {
    return 16;
  }
}

function getStrokeWidth(size: number) {
  return size / 200;
}

function getSizePlusStrokes(size: number) {
  return size + getStrokeWidth(size) * (gridSize - 1) * 2;
}

function getRoomSize(size: number) {
  return (getSizePlusStrokes(size) * roomSizeFactor) / gridSize;
}

function getDoorSize(size: number) {
  return (getSizePlusStrokes(size) * doorSizeFactor) / (gridSize - 1);
}

export default LostTemple;
