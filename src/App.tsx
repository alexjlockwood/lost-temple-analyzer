import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import './App.css';
import LostTemple, {
  Bounds,
  getBottomDoorBounds,
  getBottomDoorName,
  getRightDoorBounds,
  getRightDoorName,
  getRoomBounds,
  getRoomName,
  gridSize,
  isBottomDoorA3B3,
  isRoomA3,
} from './LostTemple';
import { LostTemplePath } from './LostTemplePath';
import { lostTemplePaths } from './LostTemplePathData';

interface Offset {
  readonly x: number;
  readonly y: number;
}

function App() {
  const [openRooms, setOpenRooms] = useState<ReadonlySet<string>>(initialOpenRooms);
  const [closedRooms, setClosedRooms] = useState<ReadonlySet<string>>(new Set());
  const [openDoors, setOpenDoors] = useState<ReadonlySet<string>>(new Set());
  const [closedDoors, setClosedDoors] = useState<ReadonlySet<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerOffset, setLastPointerOffset] = useState<Offset | undefined>(undefined);
  const [pointerId, setPointerId] = useState<number | undefined>(undefined);

  // This ref is connected to the list
  const ref = useRef<HTMLDivElement>(null);

  // The size of the list
  // It will be updated later
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  console.log(width, height);

  // This function calculates width and height of the list
  const updateSize = () => {
    const newWidth = ref?.current?.clientWidth;
    setWidth(newWidth);

    const newHeight = ref?.current?.clientHeight;
    setHeight(newHeight);
  };

  // Get 'width' and 'height' after the initial render and every time the list changes
  useEffect(() => {
    updateSize();
  }, []);

  // Update 'width' and 'height' when the window resizes
  useEffect(() => {
    window.addEventListener('resize', updateSize);
  }, []);

  const size = width === undefined || height === undefined ? undefined : Math.min(width, height);

  const filteredLostTemplePaths = lostTemplePaths
    .filter((path) => {
      const pathOpenDoors = path.openDoors;
      const pathOpenRooms = getOpenRooms(path);
      return (
        Array.from(openDoors).every((door) => pathOpenDoors.has(door)) &&
        Array.from(openRooms).every((room) => pathOpenRooms.has(room)) &&
        Array.from(closedDoors).every((door) => !pathOpenDoors.has(door)) &&
        Array.from(closedRooms).every((room) => !pathOpenRooms.has(room))
      );
    })
    .sort((a, b) => b.count - a.count);

  const roomPercentMap = createPercentMap(
    difference(roomNames, union(openRooms, closedRooms)),
    filteredLostTemplePaths,
    (roomName, path) => getOpenRooms(path).has(roomName),
  );

  const doorPercentMap = createPercentMap(
    difference(doorNames, union(openDoors, closedDoors)),
    filteredLostTemplePaths,
    (doorName, path) => path.openDoors.has(doorName),
  );

  const onRoomClick = (roomName: string) => {
    const open = new Set(openRooms);
    const closed = new Set(closedRooms);
    toggle(open, closed, roomName);
    setOpenRooms(open);
    setClosedRooms(closed);
  };

  const onDoorClick = (doorName: string) => {
    const open = new Set(openDoors);
    const closed = new Set(closedDoors);
    toggle(open, closed, doorName);
    setOpenDoors(open);
    setClosedDoors(closed);
  };

  const selectRoom = (roomName: string) => {
    const updatedOpenRooms = new Set(openRooms);
    updatedOpenRooms.add(roomName);
    setOpenRooms(updatedOpenRooms);
    const updatedClosedRooms = new Set(closedRooms);
    updatedClosedRooms.delete(roomName);
    setClosedRooms(updatedClosedRooms);
  };
  const selectDoor = (doorName: string) => {
    const updatedOpenDoors = new Set(openDoors);
    updatedOpenDoors.add(doorName);
    setOpenDoors(updatedOpenDoors);
    const updatedClosedDoors = new Set(closedDoors);
    updatedClosedDoors.delete(doorName);
    setClosedDoors(updatedClosedDoors);
  };

  // TODO: figure out why touch events on mobile arent working

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    console.log(event.clientX, event.clientY);
    if (pointerId !== undefined) {
      return;
    }
    setPointerId(event.pointerId);
    setIsDragging(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    setLastPointerOffset({ x: offsetX, y: offsetY });
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId !== event.pointerId || size === undefined) {
      return;
    }

    if (isDragging && lastPointerOffset) {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const prevX = lastPointerOffset.x;
      const prevY = lastPointerOffset.y;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (
            !isRoomA3(r, c) &&
            intersects(getRoomBounds(size, r, c), offsetX, offsetY, prevX, prevY)
          ) {
            selectRoom(getRoomName(r, c));
          }
          if (c !== gridSize - 1) {
            if (intersects(getRightDoorBounds(size, r, c), offsetX, offsetY, prevX, prevY)) {
              selectDoor(getRightDoorName(r, c));
            }
          }
          if (r !== gridSize - 1) {
            if (
              !isBottomDoorA3B3(r, c) &&
              intersects(getBottomDoorBounds(size, r, c), offsetX, offsetY, prevX, prevY)
            ) {
              selectDoor(getBottomDoorName(r, c));
            }
          }
        }
      }
      setLastPointerOffset({ x: offsetX, y: offsetY });
    }
  };
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId !== event.pointerId) {
      return;
    }
    setPointerId(undefined);
    setIsDragging(false);
    setLastPointerOffset(undefined);
  };
  const lostTemple =
    size === undefined ? (
      <></>
    ) : (
      <LostTemple
        size={size}
        openRooms={openRooms}
        openDoors={openDoors}
        closedRooms={closedRooms}
        closedDoors={closedDoors}
        roomPercentMap={roomPercentMap}
        doorPercentMap={doorPercentMap}
        onRoomClick={onRoomClick}
        onDoorClick={onDoorClick}
        showRoomNames={true}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    );
  return <Container ref={ref}>{lostTemple}</Container>;
}

const Container = styled.div`
  display: grid;
  place-items: center;
  min-height: 100vh;
  position: relative;
`;

function intersects(
  bounds: Bounds,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): boolean {
  const x1 = startX;
  const y1 = startY;
  const x2 = endX;
  const y2 = endY;
  const rx = bounds.left;
  const ry = bounds.top;
  const rw = bounds.right - bounds.left;
  const rh = bounds.bottom - bounds.top;
  const left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
  const right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
  const top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
  const bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
  return left || right || top || bottom;
}

function lineLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  return 0 <= uA && uA <= 1 && 0 <= uB && uB <= 1;
}

function createPercentMap(
  names: ReadonlySet<string>,
  paths: readonly LostTemplePath[],
  matchesPath: (name: string, path: LostTemplePath) => boolean,
): ReadonlyMap<string, number> {
  const totalPathCount = paths.reduce((p, c) => p + c.count, 0);
  const map = new Map<string, number>();
  names.forEach((name) => {
    if (totalPathCount) {
      const count = paths
        .filter((path) => matchesPath(name, path))
        .reduce((p, c) => p + c.count, 0);
      map.set(name, (count / totalPathCount) * 100);
    } else {
      map.set(name, 0);
    }
  });
  return map;
}

function union(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const _union = new Set(setA);
  setB.forEach((elem) => _union.add(elem));
  return _union;
}

function difference(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const _difference = new Set(setA);
  setB.forEach((elem) => _difference.delete(elem));
  return _difference;
}

function toggle(open: Set<string>, closed: Set<string>, name: string) {
  if (open.has(name)) {
    open.delete(name);
    closed.add(name);
  } else if (closed.has(name)) {
    closed.delete(name);
  } else {
    open.add(name);
  }
}

export function getOpenRooms(path: LostTemplePath): ReadonlySet<string> {
  return new Set(Array.from(path.openDoors).flatMap((door) => door.split(',')));
}

const initialOpenRooms: ReadonlySet<string> = new Set(['A3']);

const roomNames = new Set(
  ['A', 'B', 'C', 'D', 'E'].flatMap((rowLetter) =>
    Array.from({ length: gridSize }, (_, i) => i + 1).map(
      (colNumber) => `${rowLetter}${colNumber}`,
    ),
  ),
);

const doorNames = new Set([
  'D1,E1',
  'C1,D1',
  'B1,C1',
  'A1,B1',
  'D2,E2',
  'C2,D2',
  'B2,C2',
  'A2,B2',
  'D3,E3',
  'C3,D3',
  'B3,C3',
  'D4,E4',
  'C4,D4',
  'B4,C4',
  'A4,B4',
  'D5,E5',
  'C5,D5',
  'B5,C5',
  'A5,B5',
  'E1,E2',
  'E2,E3',
  'E3,E4',
  'E4,E5',
  'D1,D2',
  'D2,D3',
  'D3,D4',
  'D4,D5',
  'C1,C2',
  'C2,C3',
  'C3,C4',
  'C4,C5',
  'B1,B2',
  'B2,B3',
  'B3,B4',
  'B4,B5',
  'A1,A2',
  'A2,A3',
  'A3,A4',
  'A4,A5',
]);

export default App;
