import { useLayoutEffect, useState, RefObject } from "react";

export type Rect = { left: number; top: number; right: number; bottom: number };

export function isOverlapping(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

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

export function useOverlap(refs: RefObject<HTMLElement>[]): boolean[][] {
  const [overlaps, setOverlaps] = useState<boolean[][]>([]);

  useLayoutEffect(() => {
    const rects = refs.map((r) => r.current?.getBoundingClientRect());
    const result: boolean[][] = refs.map(() => Array(refs.length).fill(false));

    for (let i = 0; i < rects.length; i++) {
      for (let j = 0; j < rects.length; j++) {
        if (i === j || !rects[i] || !rects[j]) continue;
        result[i][j] = isOverlapping(rects[i] as Rect, rects[j] as Rect);
      }
    }

    setOverlaps((prev) => (equal(prev, result) ? prev : result));
  }, [refs]);

  return overlaps;
}
