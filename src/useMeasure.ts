import { useEffect, useState, useCallback } from "react";

export type MeasureBounds = {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
};

/**
 * A React hook that provides a ref object for an HTML element and measures its bounding rectangle dimensions
 * and position, including width, height, top, left, right, and bottom properties. The measurements update
 * automatically when the size or position of the element changes due to resizing or layout shifts.
 *
 * @template T - The type of the HTML element being referenced.
 * @return {[RefObject<T>, MeasureBounds]} A tuple containing a React reference object for the element and
 * its current measured bounding box values.
 */
export function useMeasure<T extends HTMLElement>(): [(instance: T | null) => void, MeasureBounds] {
    const [node, setNode] = useState<T | null>(null);
    const ref = useCallback((node: T | null) => {
        setNode(node);
    }, []);
    const [bounds, setBounds] = useState<MeasureBounds>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    });

    useEffect(() => {
        if (!node) return;
        const element = node;
        const update = () => {
            const rect = element.getBoundingClientRect();
            setBounds({
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom
            });
        };
        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(element);
        update();
        return () => resizeObserver.disconnect();
    }, [node]);

    return [ref, bounds];
}
