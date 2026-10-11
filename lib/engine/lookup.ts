import type { RangeRow } from "./tables";

export function findRow<T extends RangeRow>(rows: T[], value: number): T | undefined {
  return rows.find(
    (r) =>
      (r.minExclusive === null || value > r.minExclusive) &&
      (r.maxInclusive === null || value <= r.maxInclusive),
  );
}
