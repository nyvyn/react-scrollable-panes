import { RefObject, useLayoutEffect, useMemo, useRef, useState } from "react";

export type MeasureBounds = Pick<
    DOMRectReadOnly,
    "height" | "width"
>;

/**
 *  A React hook that provides a ref object for an HTML element and measures its bounding rectangle dimensions
 *  and position, including width, height properties. The measurements update
 *  automatically when the size or position of the element changes due to resizing or layout shifts.
 *
 *  @template T - The type of the HTML element being referenced.
 *  @return {[RefObject<T>, MeasureBounds]} A tuple containing the reference and bounding values.
 */
export function useMeasure<T extends HTMLDivElement>(): [RefObject<T | null>, MeasureBounds] {
    const ref = useRef<T>(null);
    const [bounds, setBounds] = useState<MeasureBounds>({width: 0, height: 0,});

    const observer = useMemo(() => new ResizeObserver(([entry]) => {
        if (entry && entry.borderBoxSize) {
            const {inlineSize: width, blockSize: height} = entry.borderBoxSize[0];
            setBounds({width, height});
        }
    }), []);

    useLayoutEffect(() => {
        if (!ref.current) return;
        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, []);

    return [ref, bounds];
}