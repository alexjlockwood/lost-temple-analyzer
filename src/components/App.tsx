import '../i18n/config';
import { useTranslation } from 'react-i18next';
import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import LostTemple, { getBottomDoorBounds, getRightDoorBounds, getRoomBounds } from './LostTemple';
import { LostTemplePath } from '../scripts/lostTemplePath';
import { lostTemplePaths } from '../scripts/lostTemplePathData';
import { Alert, Button, Snackbar, Typography } from '@mui/material';
import useResizeObserver from '@react-hook/resize-observer';

import ReactGA from 'react-ga4';
import { defaultInitialState, initialOpenRooms, InitialState } from '../scripts/initialState';
import {
  copyQueryStringToClipboard,
  decodeQueryString,
  encodeQueryString,
  getQueryString,
} from '../scripts/queryStringUtils';
import { areSetsEqual, difference, intersects, toggle, union } from '../scripts/mathUtils';
import {
  allDoorNames,
  allRoomNames,
  getBottomDoorName,
  getRightDoorName,
  getRoomName,
  gridSize,
  isBottomDoorA3B3,
  isRoomA3,
} from '../scripts/lostTempleUtils';
import PossiblePathsPanel from './PossiblePathsPanel';

ReactGA.initialize('G-J8W430VTF9');
ReactGA.send('pageview');

// TODO: it doesnt work in landscape on phones
// TODO: have some indication that a path is impossible in the UI if it is chosen
// TODO: add service worker eventually so can be put on home screen on phone
// TODO: show the link in the snackbar if it fails?
// TODO: add discord link, link to twitter, about section
// TODO: handle onPointerCancel?
// TODO: figure out why the main screen doesn't look centered

// TODO: make this percentage based instead?
const maxLostTempleSize = 720;
const columnContainerMargin = 16;

// TODO: make this dynamic based on screen size
const panelWidth = 720;
const panelNumColumns = 3;
const isPanelVisible = false;

const initialState = (function (): InitialState {
  const queryString = getQueryString();
  return queryString === null ? defaultInitialState : decodeQueryString(queryString);
})();

function useSize(target: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = React.useState<DOMRect | undefined>(undefined);
  useLayoutEffect(() => setSize(target?.current?.getBoundingClientRect()), [target]);
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
}

function App() {
  const { t } = useTranslation();

  const [openRooms, setOpenRooms] = useState<ReadonlySet<string>>(initialState.openRooms);
  const [closedRooms, setClosedRooms] = useState<ReadonlySet<string>>(initialState.closedRooms);
  const [openDoors, setOpenDoors] = useState<ReadonlySet<string>>(initialState.openDoors);
  const [closedDoors, setClosedDoors] = useState<ReadonlySet<string>>(initialState.closedDoors);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerOffset, setLastPointerOffset] = useState<Offset | undefined>(undefined);
  const [pointerId, setPointerId] = useState<number | undefined>(undefined);

  const columnContainerRef = useRef<HTMLDivElement>(null);
  const columnContainerRect = useSize(columnContainerRef);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRect = useSize(headerContainerRef);

  const columnContainerWidth = columnContainerRect?.width;
  const columnContainerHeight = columnContainerRect?.height;
  const headerContainerHeight = headerContainerRect?.height;
  const lostTempleSize =
    columnContainerWidth === undefined ||
    columnContainerHeight === undefined ||
    headerContainerHeight === undefined
      ? undefined
      : Math.min(
          maxLostTempleSize,
          Math.min(columnContainerWidth, columnContainerHeight - headerContainerHeight),
        );

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

  const filteredLostTemplePaths = lostTemplePaths
    .filter((path) => {
      const pathOpenDoors = path.openDoors;
      const pathOpenRooms = path.openRooms;
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
    (roomName, path) => path.openRooms.has(roomName),
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

  const resetDragState = () => {
    setPointerId(undefined);
    setIsDragging(false);
    setLastPointerOffset(undefined);
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
    if (event.buttons === 0) {
      resetDragState();
      return;
    }
    if (pointerId !== event.pointerId || lostTempleSize === undefined) {
      return;
    }

    if (isDragging && lastPointerOffset) {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const prevX = lastPointerOffset.x;
      const prevY = lastPointerOffset.y;
      const size = lostTempleSize;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (
            !isRoomA3(r, c) &&
            intersects(getRoomBounds(r, c, size), offsetX, offsetY, prevX, prevY)
          ) {
            selectRoom(getRoomName(r, c));
          }
          if (c !== gridSize - 1) {
            if (intersects(getRightDoorBounds(r, c, size), offsetX, offsetY, prevX, prevY)) {
              selectDoor(getRightDoorName(r, c));
            }
          }
          if (r !== gridSize - 1) {
            if (
              !isBottomDoorA3B3(r, c) &&
              intersects(getBottomDoorBounds(r, c, size), offsetX, offsetY, prevX, prevY)
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
    resetDragState();
  };

  const isInitialState =
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
      <RowContainer>
        <ColumnContainer ref={columnContainerRef}>
          <HeaderContainer ref={headerContainerRef}>
            <Typography align="center" variant="subtitle1">
              {t('description')}
            </Typography>
            <ButtonContainer>
              <Button disabled={isInitialState} onClick={onResetClick} color="inherit">
                {t('resetGridButton')}
              </Button>
              <Button disabled={isInitialState} onClick={onGetLinkClick} color="inherit">
                {t('copyLinkButton')}
              </Button>
            </ButtonContainer>
          </HeaderContainer>
          <LostTempleContainer>{lostTemple}</LostTempleContainer>
        </ColumnContainer>
        {isPanelVisible ? (
          <PossiblePathsPanel
            width={panelWidth}
            numColumns={panelNumColumns}
            possiblePaths={filteredLostTemplePaths}
          />
        ) : undefined}
      </RowContainer>
      <Snackbar
        open={isSuccessSnackbarShown}
        autoHideDuration={6000}
        onClose={onSuccessSnackbarClosed}
        message={t('copyLinkToClipboardSuccess')}
      />
      <Snackbar open={isErrorSnackbarShown} autoHideDuration={6000} onClose={onErrorSnackbarClosed}>
        <Alert onClose={onErrorSnackbarClosed} severity="error">
          {t('copyLinkToClipboardError')}
        </Alert>
      </Snackbar>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  height: 100vh;
`;

const RowContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const ColumnContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  margin: ${columnContainerMargin}px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 24px;
`;

const LostTempleContainer = styled.div`
  display: grid;
  place-items: center;
`;

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

interface Offset {
  readonly x: number;
  readonly y: number;
}

export default App;
