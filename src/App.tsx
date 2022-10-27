import React, { useState } from 'react';
import './App.css';
import LostTemple, { gridSize } from './LostTemple';
import { LostTemplePath } from './LostTemplePath';
import { lostTemplePaths } from './LostTemplePathData';
import PossiblePathsGrid from './PossiblePathsGrid';

function App() {
  const [openRooms, setOpenRooms] = useState<ReadonlySet<string>>(initialOpenRooms);
  const [closedRooms, setClosedRooms] = useState<ReadonlySet<string>>(new Set());
  const [openDoors, setOpenDoors] = useState<ReadonlySet<string>>(new Set());
  const [closedDoors, setClosedDoors] = useState<ReadonlySet<string>>(new Set());

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

  // TODO: make this a grid
  const showGrid = false;

  return showGrid ? (
    <PossiblePathsGrid possiblePaths={filteredLostTemplePaths} />
  ) : (
    <div className="App">
      <LostTemple
        openRooms={openRooms}
        openDoors={openDoors}
        closedRooms={closedRooms}
        closedDoors={closedDoors}
        roomPercentMap={roomPercentMap}
        doorPercentMap={doorPercentMap}
        onRoomClick={onRoomClick}
        onDoorClick={onDoorClick}
        showRoomNames={true}
      />
    </div>
  );
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
