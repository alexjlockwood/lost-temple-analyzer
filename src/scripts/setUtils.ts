export function union(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const _union = new Set(setA);
  setB.forEach((elem) => _union.add(elem));
  return _union;
}

export function difference(setA: ReadonlySet<string>, setB: ReadonlySet<string>) {
  const _difference = new Set(setA);
  setB.forEach((elem) => _difference.delete(elem));
  return _difference;
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
