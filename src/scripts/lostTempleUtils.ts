export const gridSize = 5;

const roomNames = ['E', 'D', 'C', 'B', 'A'].map((rowLetter) =>
  Array.from({ length: gridSize }, (_, i) => i + 1).map((colNumber) => `${rowLetter}${colNumber}`),
);

export const allRoomNames = new Set(roomNames.flatMap((r) => r));

export const allDoorNames = new Set(
  (function () {
    const doorNames = new Set<string>();
    for (let r = 0; r < roomNames.length; r++) {
      for (let c = 0; c < roomNames.length; c++) {
        if (c !== gridSize - 1) {
          doorNames.add(getRightDoorName(r, c));
        }
        if (r !== gridSize - 1 && !isBottomDoorA3B3(r, c)) {
          doorNames.add(getBottomDoorName(r, c));
        }
      }
    }
    return doorNames;
  })(),
);

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

export function isBottomDoorA3B3(r: number, c: number): boolean {
  return getBottomDoorName(r, c) === 'A3,B3';
}
