import React, { useState, useRef, useCallback } from "react";

/**
 * A React hook that provides a callback ref for an HTML element that triggers ResizeObserver
 * on the element's border box, returning its width and height.
 * Measurements update automatically when the element resizes.
 *
 * @return {[ (node: HTMLElement | null) => void, {width: number | null; height: number | null} ]}
 */
export function useMeasure() {
    const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({
        width: null,
        height: null,
    });

    const previousObserver = useRef<ResizeObserver | null>(null);

    const customRef = useCallback((node: HTMLElement | null) => {
        if (previousObserver.current) {
            previousObserver.current.disconnect();
            previousObserver.current = null;
        }

        if (node) {
            const observer = new ResizeObserver(([entry]) => {
                if (entry && entry.borderBoxSize) {
                    const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
                    setDimensions({ width, height });
                }
            });

            observer.observe(node);
            previousObserver.current = observer;
        }
    }, []);

    return [customRef, dimensions] as const;
}
