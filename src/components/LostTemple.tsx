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
import { Bounds } from '../scripts/bounds';

const roomSizeFactor = 0.7;
const doorSizeFactor = 1 - roomSizeFactor;

interface LostTempleProps {
  readonly size: number;
  readonly openRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
  readonly closedDoors?: ReadonlySet<string>;
  readonly knownRooms?: ReadonlySet<string>;
  readonly knownDoors?: ReadonlySet<string>;
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
  closedDoors,
  knownRooms,
  knownDoors,
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

  const cells: JSX.Element[] = [];

  const getPercentString = (percent: number | undefined) => {
    if (percent === undefined || percent === 0 || percent === 100) {
      return undefined;
    }
    return `${Math.round(Math.max(Math.min(percent, 99), 1))}%`;
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const doorInset = (roomSize - doorSize) / 2;
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        const doorBounds = getRightDoorBounds(r, c, size);
        const updatedDoorBounds = {
          ...doorBounds,
          top: doorBounds.top + doorInset,
          bottom: doorBounds.bottom - doorInset,
        };
        const doorPercent = doorPercentMap?.get(doorName);
        cells.push(
          <Cell
            key={doorName}
            name={getPercentString(doorPercent)}
            bounds={updatedDoorBounds}
            color={getColor(openDoors, closedDoors, knownDoors, doorName, doorPercent)}
            strokeWidth={getStrokeWidth(size)}
            fontSize={doorFontSize}
            onClick={onDoorClick ? () => onDoorClick(doorName) : undefined}
          />,
        );
      }
      if (r !== gridSize - 1 && !isBottomDoorA3B3(r, c)) {
        const doorName = getBottomDoorName(r, c);
        const doorBounds = getBottomDoorBounds(r, c, size);
        const updatedDoorBounds = {
          ...doorBounds,
          left: doorBounds.left + doorInset,
          right: doorBounds.right - doorInset,
        };
        const doorPercent = doorPercentMap?.get(doorName);
        cells.push(
          <Cell
            key={doorName}
            name={getPercentString(doorPercent)}
            bounds={updatedDoorBounds}
            color={getColor(openDoors, closedDoors, knownDoors, doorName, doorPercent)}
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
      const roomColor = getColor(openRooms, undefined, knownRooms, roomName, roomPercent);
      cells.push(
        <Cell
          key={roomName}
          name={showRoomNames ? roomName : undefined}
          bounds={getRoomBounds(r, c, size)}
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
      onContextMenu={(event) => event.preventDefault()}
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
  knownNames: ReadonlySet<string> | undefined,
  name: string,
  percent: number | undefined,
): string {
  if (knownNames?.has(name)) {
    return getKnownColor();
  } else if (openNames.has(name)) {
    return getGreenColor();
  } else if (closedNames?.has(name)) {
    return getRedColor();
  } else if (percent === 100) {
    return getGreenColor(true);
  } else if (percent === 0) {
    return getRedColor(true);
  } else {
    return '#fff';
  }
}

function getGreenColor(isLight: boolean = false) {
  return isLight ? '#DAF7DC' : `#4BE77A`;
}

function getRedColor(isLight: boolean = false) {
  return isLight ? '#EFC7BE' : `#DB3615`;
}

function getKnownColor() {
  return 'rgba(0, 0, 0, 0.4)';
}

export function getRoomBounds(r: number, c: number, size: number): Bounds {
  const roomOffsetX = (getRoomSize(size) + getDoorSize(size) - getStrokeWidth(size) * 2) * c;
  const roomOffsetY = (getRoomSize(size) + getDoorSize(size) - getStrokeWidth(size) * 2) * r;
  return {
    left: roomOffsetX,
    top: roomOffsetY,
    right: roomOffsetX + getRoomSize(size),
    bottom: roomOffsetY + getRoomSize(size),
  };
}

export function getRightDoorBounds(r: number, c: number, size: number): Bounds {
  const roomBounds = getRoomBounds(r, c, size);
  const doorOffsetX = roomBounds.left + getRoomSize(size) - getStrokeWidth(size);
  const doorOffsetY = roomBounds.top;
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + getDoorSize(size),
    bottom: doorOffsetY + getRoomSize(size),
  };
}

export function getBottomDoorBounds(r: number, c: number, size: number): Bounds {
  const roomBounds = getRoomBounds(r, c, size);
  const doorOffsetX = roomBounds.left;
  const doorOffsetY = roomBounds.top + getRoomSize(size) - getStrokeWidth(size);
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + getRoomSize(size),
    bottom: doorOffsetY + getDoorSize(size),
  };
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
