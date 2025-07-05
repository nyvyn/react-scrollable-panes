import { useLayoutEffect, useState, RefObject, useRef, useCallback } from "react";

export type Rect = { left: number; top: number; right: number; bottom: number };

/**
 * Determines if two rectangles overlap.
 *
 * @param {Rect} a - The first rectangle, defined by its boundaries (left, right, top, bottom).
 * @param {Rect} b - The second rectangle, defined by its boundaries (left, right, top, bottom).
 * @return {boolean} True if the rectangles overlap, otherwise false.
 */
export function isOverlapping(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Compares two 2D boolean arrays for equality, checking if they have the same dimensions and values.
 *
 * @param {boolean[][]} a - The first 2D boolean array to compare
 * @param {boolean[][]} b - The second 2D boolean array to compare
 * @return {boolean} True if arrays are equal in both dimensions and values, false otherwise
 */
function equal(a: boolean[][], b: boolean[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

/**
 * Calculates and tracks overlap states between a list of HTMLDivElement references.
 *
 * @param {RefObject<HTMLDivElement | null>[]} refs - An array of references to HTMLDivElement elements.
 * @return {boolean[][]} A 2D boolean array indicating overlapping states, where `result[i][j]` is true if `refs[i]` and `refs[j]` overlap, and false otherwise.
 */
export function useOverlap(refs: RefObject<HTMLDivElement | null>[]): [boolean[][], () => void] {
  const overlaps = useRef<boolean[][]>([]);
  const [tick, setTick] = useState(0);
  const update = useCallback(() => setTick(t => t + 1), []);

  useLayoutEffect(() => {
    const rects = refs.map((r) => r.current?.getBoundingClientRect());
    const result: boolean[][] = refs.map(() => Array(refs.length).fill(false));

    for (let i = 0; i < rects.length; i++) {
      for (let j = 0; j < rects.length; j++) {
        if (i === j || !rects[i] || !rects[j]) continue;
        result[i][j] = isOverlapping(rects[i] as Rect, rects[j] as Rect);
      }
    }

    overlaps.current = equal(overlaps.current, result) ? overlaps.current : result;
  }, [refs, tick]);

  return [overlaps.current, update];
}
