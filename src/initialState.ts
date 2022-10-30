export interface InitialState {
  readonly openRooms: ReadonlySet<string>;
  readonly closedRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
  readonly closedDoors: ReadonlySet<string>;
}

export const initialOpenRooms: ReadonlySet<string> = new Set(['A3']);

export const defaultInitialState: InitialState = {
  openRooms: initialOpenRooms,
  closedRooms: new Set<string>(),
  openDoors: new Set<string>(),
  closedDoors: new Set<string>(),
};
