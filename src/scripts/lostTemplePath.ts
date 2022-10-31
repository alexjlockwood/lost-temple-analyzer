export interface LostTemplePath {
  readonly openDoors: ReadonlySet<string>;
  readonly openRooms: ReadonlySet<string>;
  readonly count: number;
}
