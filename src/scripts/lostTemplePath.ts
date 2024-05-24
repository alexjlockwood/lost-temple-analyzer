export interface LostTemplePath {
  readonly key: number;
  readonly openDoors: ReadonlySet<string>;
  readonly openRooms: ReadonlySet<string>;
  readonly percent: number;
}
