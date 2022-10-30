import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import LostTemple, {
  Bounds,
  getBottomDoorBounds,
  getRightDoorBounds,
  getRoomBounds,
} from './LostTemple';
import { LostTemplePath } from './LostTemplePath';
import { lostTemplePaths } from './LostTemplePathData';
import { Alert, Button, Snackbar, Typography } from '@mui/material';

import ReactGA from 'react-ga4';
import { defaultInitialState, initialOpenRooms } from './initialState';
import {
  copyQueryStringToClipboard,
  decodeQueryString,
  encodeQueryString,
  getQueryString,
} from './queryString';
import { areSetsEqual, difference, toggle, union } from './setUtils';
import {
  allDoorNames,
  allRoomNames,
  getBottomDoorName,
  getRightDoorName,
  getRoomName,
  gridSize,
  isBottomDoorA3B3,
  isRoomA3,
} from './lostTempleUtils';

ReactGA.initialize('G-J8W430VTF9');
ReactGA.send('pageview');

// TODO: set up manifest.json so can be put on home screen on phones
// TODO: add social media links and thumbnails and favicon stuff
// TODO: it doesnt work in landscape on phones
// TODO: have some indication that a path is impossible in the UI if it is chosen

// TODO: make this percentage based instead?
const maxLostTempleSize = 720;

const queryString = getQueryString();
const initialState = queryString === null ? defaultInitialState : decodeQueryString(queryString);

function App() {
  const [openRooms, setOpenRooms] = useState<ReadonlySet<string>>(initialState.openRooms);
  const [closedRooms, setClosedRooms] = useState<ReadonlySet<string>>(initialState.closedRooms);
  const [openDoors, setOpenDoors] = useState<ReadonlySet<string>>(initialState.openDoors);
  const [closedDoors, setClosedDoors] = useState<ReadonlySet<string>>(initialState.closedDoors);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerOffset, setLastPointerOffset] = useState<Offset | undefined>(undefined);
  const [pointerId, setPointerId] = useState<number | undefined>(undefined);

  const [isSuccessSnackbarShown, setSuccessSnackbarShown] = useState(false);
  const onSuccessSnackbarClosed = () => setSuccessSnackbarShown(false);
  const [isErrorSnackbarShown, setErrorSnackbarShown] = useState(false);
  const onErrorSnackbarClosed = () => setErrorSnackbarShown(false);

  const onGetLinkClick = () => {
    const queryString = encodeQueryString(openRooms, closedRooms, openDoors, closedDoors);
    copyQueryStringToClipboard(
      queryString,
      () => {
        setSuccessSnackbarShown(true);
        setErrorSnackbarShown(false);
      },
      () => {
        setSuccessSnackbarShown(false);
        setErrorSnackbarShown(true);
      },
    );
  };

  const lostTempleRef = useRef<HTMLDivElement>(null);
  const [lostTempleSize, setLostTempleSize] = useState<number | undefined>(undefined);
  const updateLostTempleSize = () => {
    const width = lostTempleRef?.current?.clientWidth;
    const height = lostTempleRef?.current?.clientHeight;
    const size =
      width === undefined || height === undefined
        ? undefined
        : Math.min(maxLostTempleSize, Math.min(width, height));
    setLostTempleSize(size);
  };
  useEffect(updateLostTempleSize, []);
  useEffect(() => window.addEventListener('resize', updateLostTempleSize), []);

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
    difference(allRoomNames, union(openRooms, closedRooms)),
    filteredLostTemplePaths,
    (roomName, path) => getOpenRooms(path).has(roomName),
  );

  const doorPercentMap = createPercentMap(
    difference(allDoorNames, union(openDoors, closedDoors)),
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

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
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
    if (pointerId !== event.pointerId || lostTempleSize === undefined) {
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
            intersects(getRoomBounds(lostTempleSize, r, c), offsetX, offsetY, prevX, prevY)
          ) {
            selectRoom(getRoomName(r, c));
          }
          if (c !== gridSize - 1) {
            if (
              intersects(getRightDoorBounds(lostTempleSize, r, c), offsetX, offsetY, prevX, prevY)
            ) {
              selectDoor(getRightDoorName(r, c));
            }
          }
          if (r !== gridSize - 1) {
            if (
              !isBottomDoorA3B3(r, c) &&
              intersects(getBottomDoorBounds(lostTempleSize, r, c), offsetX, offsetY, prevX, prevY)
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

  const resetDisabled =
    areSetsEqual(openRooms, initialOpenRooms) &&
    closedRooms.size === 0 &&
    openDoors.size === 0 &&
    closedDoors.size === 0;

  const onResetClick = () => {
    setOpenRooms(initialOpenRooms);
    setClosedRooms(new Set());
    setOpenDoors(new Set());
    setClosedDoors(new Set());
  };

  const lostTemple =
    lostTempleSize === undefined ? (
      <></>
    ) : (
      <LostTemple
        size={lostTempleSize}
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

  return (
    <AppContainer>
      <ColumnContainer>
        <Typography align="center" variant="subtitle1">
          Click or drag the Lost Temple below to view the door probabilities of different paths.
        </Typography>
        <ButtonContainer>
          <Button disabled={resetDisabled} onClick={onResetClick} color="inherit">
            Reset grid
          </Button>
          <Button onClick={onGetLinkClick} color="inherit">
            Copy link
          </Button>
        </ButtonContainer>
        <LostTempleContainer ref={lostTempleRef}>{lostTemple}</LostTempleContainer>
      </ColumnContainer>
      <Snackbar
        open={isSuccessSnackbarShown}
        autoHideDuration={6000}
        onClose={onSuccessSnackbarClosed}
        message="Link copied to clipboard"
      />
      <Snackbar open={isErrorSnackbarShown} autoHideDuration={6000} onClose={onErrorSnackbarClosed}>
        <Alert onClose={onErrorSnackbarClosed} severity="success">
          Unable to copy link to clipboard
        </Alert>
      </Snackbar>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
`;

const ColumnContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const LostTempleContainer = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  flex-grow: 1;
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

export function getOpenRooms(path: LostTemplePath): ReadonlySet<string> {
  return new Set(Array.from(path.openDoors).flatMap((door) => door.split(',')));
}

interface Offset {
  readonly x: number;
  readonly y: number;
}

export default App;
