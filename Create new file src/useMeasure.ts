import { useState, useRef, useEffect, RefObject } from "react";

export type MeasureBounds = {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export default function useMeasure<T extends HTMLElement>(): [RefObject<T>, MeasureBounds] {
    const ref = useRef<T>(null);
    const [bounds, setBounds] = useState<MeasureBounds>({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    });

    useEffect(() => {
        if (!ref.current) return;
        const element = ref.current;
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
    }, [ref]);

    return [ref, bounds];
}
