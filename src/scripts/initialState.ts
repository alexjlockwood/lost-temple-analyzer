export interface InitialState {
  readonly openRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
  readonly closedDoors: ReadonlySet<string>;
}

export const initialOpenRooms: ReadonlySet<string> = new Set(['A3']);

export const defaultInitialState: InitialState = {
  openRooms: initialOpenRooms,
  openDoors: new Set<string>(),
  closedDoors: new Set<string>(),
};
