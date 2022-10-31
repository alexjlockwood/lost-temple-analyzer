export const gridSize = 5;

export const allRoomNames = (function (): ReadonlySet<string> {
  const roomNames = new Set<string>();
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      roomNames.add(getRoomName(r, c));
    }
  }
  return roomNames;
})();

export const allDoorNames = (function (): ReadonlySet<string> {
  const doorNames = new Set<string>();
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (c !== gridSize - 1) {
        doorNames.add(getRightDoorName(r, c));
      }
      if (r !== gridSize - 1 && !isBottomDoorA3B3(r, c)) {
        doorNames.add(getBottomDoorName(r, c));
      }
    }
  }
  return doorNames;
})();

export function getRoomName(r: number, c: number): string {
  return `${String.fromCharCode('E'.charCodeAt(0) - r)}${c + 1}`;
}

export function getRightDoorName(r: number, c: number): string {
  return [getRoomName(r, c), getRoomName(r, c + 1)].sort().join(',');
}

export function getBottomDoorName(r: number, c: number): string {
  return [getRoomName(r, c), getRoomName(r + 1, c)].sort().join(',');
}

export function isRoomA3(r: number, c: number): boolean {
  return getRoomName(r, c) === 'A3';
}

export function isRoomE3(r: number, c: number): boolean {
  return getRoomName(r, c) === 'E3';
}

export function isBottomDoorA3B3(r: number, c: number): boolean {
  return getBottomDoorName(r, c) === 'A3,B3';
}
