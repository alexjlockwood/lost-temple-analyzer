import { Bounds } from './bounds';

export function union(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const result = new Set(setA);
  setB.forEach((elem) => result.add(elem));
  return result;
}

export function difference(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const result = new Set(setA);
  setB.forEach((elem) => result.delete(elem));
  return result;
}

export function toggle(open: Set<string>, closed: Set<string>, name: string) {
  if (open.has(name)) {
    open.delete(name);
    closed.add(name);
  } else if (closed.has(name)) {
    closed.delete(name);
  } else {
    open.add(name);
  }
}

export function areSetsEqual(set1: ReadonlySet<string>, set2: ReadonlySet<string>): boolean {
  return set1.size === set2.size && Array.from(set1).every((s) => set2.has(s));
}

export function intersection(set1: ReadonlySet<string>, set2: ReadonlySet<string>) {
  const result = new Set();
  set2.forEach((elem) => {
    if (set1.has(elem)) {
      result.add(elem);
    }
  });
  return result;
}

/**
 * Returns true if the rectangle intersects with a line.
 */
export function intersects(
  bounds: Bounds,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
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

/**
 * Returns true if the line intersects with another line.
 */
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
