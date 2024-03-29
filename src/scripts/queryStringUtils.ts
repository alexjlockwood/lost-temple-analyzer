import HashIds from 'hashids';
import { defaultInitialState, initialOpenRooms, InitialState } from './initialState';
import {
  getBottomDoorName,
  getRightDoorName,
  getRoomName,
  gridSize,
  isRoomA3,
} from './lostTempleUtils';
import { NumberLike } from 'hashids/cjs/util';

const hashIds = new HashIds('lost-temple-analyzer');
const queryParam = 'p';

export function encodeQueryString(
  openRooms: ReadonlySet<string>,
  openDoors: ReadonlySet<string>,
  closedDoors: ReadonlySet<string>,
) {
  const openBinary: number[] = [];
  const closedBinary: number[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isRoomA3(r, c)) {
        const roomName = getRoomName(r, c);
        openBinary.push(openRooms.has(roomName) ? 1 : 0);
        closedBinary.push(0);
      }
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        openBinary.push(openDoors.has(doorName) ? 1 : 0);
        closedBinary.push(closedDoors.has(doorName) ? 1 : 0);
      }
      if (r !== gridSize - 1) {
        const doorName = getBottomDoorName(r, c);
        openBinary.push(openDoors.has(doorName) ? 1 : 0);
        closedBinary.push(closedDoors.has(doorName) ? 1 : 0);
      }
    }
  }
  const openBinary1 = openBinary.slice(0, 32);
  const openBinary2 = openBinary.slice(32, 64);
  const closedBinary1 = closedBinary.slice(0, 32);
  const closedBinary2 = closedBinary.slice(32, 64);
  const openNum1 = parseInt(openBinary1.join(''), 2);
  const openNum2 = parseInt(openBinary2.join(''), 2);
  const closedNum1 = parseInt(closedBinary1.join(''), 2);
  const closedNum2 = parseInt(closedBinary2.join(''), 2);
  return hashIds.encode([openNum1, openNum2, closedNum1, closedNum2]);
}

export function decodeQueryString(queryString: string): InitialState {
  let decodedNums: NumberLike[];
  try {
    decodedNums = hashIds.decode(queryString.replaceAll('/', ''));
  } catch (e) {
    // Handle faulty query param.
    return defaultInitialState;
  }

  if (!decodedNums || !decodedNums.length) {
    // Handle faulty query param.
    return defaultInitialState;
  }

  const decodedBinaryNums = decodedNums.map((n) => {
    const binary = n.toString(2);
    return '0'.repeat(32 - binary.length) + binary;
  });
  const decodedOpen = decodedBinaryNums[0].concat(decodedBinaryNums[1]);
  const decodedClosed = decodedBinaryNums[2].concat(decodedBinaryNums[3]);

  const openRooms = new Set<string>(initialOpenRooms);
  const openDoors = new Set<string>();
  const closedDoors = new Set<string>();

  let currentOffset = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isRoomA3(r, c)) {
        const roomName = getRoomName(r, c);
        if (decodedOpen.charAt(currentOffset) === '1') {
          openRooms.add(roomName);
        }
        currentOffset++;
      }
      if (c !== gridSize - 1) {
        const doorName = getRightDoorName(r, c);
        if (decodedOpen.charAt(currentOffset) === '1') {
          openDoors.add(doorName);
        }
        if (decodedClosed.charAt(currentOffset) === '1') {
          closedDoors.add(doorName);
        }
        currentOffset++;
      }
      if (r !== gridSize - 1) {
        const doorName = getBottomDoorName(r, c);
        if (decodedOpen.charAt(currentOffset) === '1') {
          openDoors.add(doorName);
        }
        if (decodedClosed.charAt(currentOffset) === '1') {
          closedDoors.add(doorName);
        }
        currentOffset++;
      }
    }
  }
  return { openRooms, openDoors, closedDoors };
}

export function copyQueryStringToClipboard(
  queryString: string,
  onSuccess: () => void,
  onError: () => void,
) {
  const host = window.location.host.replaceAll('/', '');
  const pathname = window.location.pathname.replaceAll('/', '');
  const copiedUrl = `${window.location.protocol}//${host}/${pathname}?${queryParam}=${queryString}`;
  navigator.clipboard.writeText(copiedUrl).then(onSuccess, onError);
}

export function getQueryString() {
  return new URLSearchParams(window.location.search).get(queryParam);
}
