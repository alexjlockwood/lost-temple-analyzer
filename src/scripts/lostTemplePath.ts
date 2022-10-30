export interface LostTemplePath {
  readonly openDoors: ReadonlySet<string>;
  readonly count: number;
}

export function getOpenRooms(path: LostTemplePath): ReadonlySet<string> {
  return new Set(Array.from(path.openDoors).flatMap((door) => door.split(',')));
}
