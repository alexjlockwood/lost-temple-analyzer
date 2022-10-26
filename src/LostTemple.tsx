import React from 'react';
import './App.css';
import Cell from './Cell';
import styled, { css } from 'styled-components';

const roomSizeFactor = 0.7;
const doorSizeFactor = 1 - roomSizeFactor;
export const gridSize = 5;

// TODO: make this dynamic
const minSize = 900;
export const strokeWidth = 5;
const sizePlusStrokes = minSize + strokeWidth * (gridSize - 1) * 2;
const roomSize = (sizePlusStrokes * roomSizeFactor) / gridSize;
const doorSize = (sizePlusStrokes * doorSizeFactor) / (gridSize - 1);

const roomNames = ['E', 'D', 'C', 'B', 'A'].map((rowLetter) =>
  Array.from({ length: gridSize }, (_, i) => i + 1).map((colNumber) => `${rowLetter}${colNumber}`),
);

// isOpenRoom = { it in appState.openRooms },
// isClosedRoom = { it in appState.closedRooms },
// isOpenDoor = { it in appState.openDoors },
// isClosedDoor = { it in appState.closedDoors },
// onRoomClick = { appState.toggleRoom(it) },
// onDoorClick = { appState.toggleDoor(it) },
// onRoomDrag = { appState.selectRoom(it) },
// onDoorDrag = { appState.selectDoor(it) },
// getRoomPercent = { roomPercentMap[it] },
// getDoorPercent = { doorPercentMap[it] },
// showRoomNames = true,

interface LostTempleProps {
  readonly openRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
  readonly closedRooms?: ReadonlySet<string>;
  readonly closedDoors?: ReadonlySet<string>;
  readonly roomPercentMap?: ReadonlyMap<string, number>;
  readonly doorPercentMap?: ReadonlyMap<string, number>;
  readonly onRoomClick?: (roomName: string) => void;
  readonly onDoorClick?: (doorName: string) => void;
  readonly showRoomNames?: boolean;
}

function LostTemple({
  openRooms,
  openDoors,
  closedRooms,
  closedDoors,
  roomPercentMap,
  doorPercentMap,
  onRoomClick,
  onDoorClick,
  showRoomNames,
}: LostTempleProps) {
  const cells = roomNames.flatMap((row, r) => {
    return row.flatMap((_, c) => {
      const roomName = getRoomName(r, c);
      const roomColor = getColor(openRooms, closedRooms, roomName);
      const rowCells = [
        <Cell
          name={showRoomNames ? roomName : undefined}
          bounds={getRoomBounds(r, c)}
          color={roomColor}
          onClick={onRoomClick ? () => onRoomClick(roomName) : undefined}
        />,
      ];
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        const doorPercent = doorPercentMap?.get(doorName);
        const doorPercentRounded = doorPercent === undefined ? undefined : Math.round(doorPercent);
        const doorPercentString =
          doorPercentRounded === undefined ? undefined : `${doorPercentRounded}`;
        const doorColor = getColor(openDoors, closedDoors, doorName);
        const doorBounds = getRightDoorBounds(r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          top: doorBounds.top + (roomSize - doorSize) / 2,
          bottom: doorBounds.bottom - (roomSize - doorSize) / 2,
        };
        rowCells.push(
          <Cell
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
          doorPercentRounded === undefined ? undefined : `${doorPercentRounded}`;
        const doorColor = getColor(openDoors, closedDoors, doorName);
        const doorBounds = getBottomDoorBounds(r, c);
        const updatedDoorBounds = {
          ...doorBounds,
          left: doorBounds.left + (roomSize - doorSize) / 2,
          right: doorBounds.right - (roomSize - doorSize) / 2,
        };
        rowCells.push(
          <Cell
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
  // TODO: add keys to fix react lint error
  return <Container>{cells}</Container>;
}

const Container = styled.div`
  position: relative;
`;

function getColor(
  openNames: ReadonlySet<string>,
  closedNames: ReadonlySet<string> | undefined,
  name: string,
): string {
  return openNames.has(name) ? '#0f0' : closedNames && closedNames.has(name) ? '#f00' : '#fff';
}

function getRoomBounds(r: number, c: number): Bounds {
  const roomOffsetX = (roomSize + doorSize - strokeWidth * 2) * c;
  const roomOffsetY = (roomSize + doorSize - strokeWidth * 2) * r;
  return {
    left: roomOffsetX,
    top: roomOffsetY,
    right: roomOffsetX + roomSize,
    bottom: roomOffsetY + roomSize,
  };
}

function getRightDoorBounds(r: number, c: number): Bounds {
  const roomBounds = getRoomBounds(r, c);
  const doorOffsetX = roomBounds.left + roomSize - strokeWidth;
  const doorOffsetY = roomBounds.top;
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + doorSize,
    bottom: doorOffsetY + roomSize,
  };
}

function getBottomDoorBounds(r: number, c: number): Bounds {
  const roomBounds = getRoomBounds(r, c);
  const doorOffsetX = roomBounds.left;
  const doorOffsetY = roomBounds.top + roomSize - strokeWidth;
  return {
    left: doorOffsetX,
    top: doorOffsetY,
    right: doorOffsetX + roomSize,
    bottom: doorOffsetY + doorSize,
  };
}

function getRoomName(r: number, c: number): string {
  return roomNames[r][c];
}

function getRightDoorName(r: number, c: number): string {
  return [getRoomName(r, c), roomNames[r][c + 1]].sort().join(',');
}

function getBottomDoorName(r: number, c: number): string {
  return [getRoomName(r, c), roomNames[r + 1][c]].sort().join(',');
}

function isRoomA3(r: number, c: number): boolean {
  return getRoomName(r, c) == 'A3';
}

function isBottomDoorA3B3(r: number, c: number): boolean {
  return getBottomDoorName(r, c) == 'A3,B3';
}

export interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export default LostTemple;
