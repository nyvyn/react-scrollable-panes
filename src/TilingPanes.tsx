import { useCallback, useLayoutEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Pane, PaneData, PaneRenderer } from "./Pane";

interface Props {
    initial: PaneData[];
    minWidth?: number; // px
    gap?: number; // px
}

export function TilingPanes({
    initial,
    minWidth = 380,
    gap = 16,
}: Props): JSX.Element {
    const [panes, setPanes] = useState<PaneData[]>(initial);
    const [ref, bounds] = useMeasure();

    // adds or replaces the rightmost pane
    const openPane = useCallback(
        (next: PaneData) =>
            setPanes((prev) => {
                const i = prev.findIndex((p: { id: string; }) => p.id === next.id);
                return i === -1 ? [...prev, next] : [...prev.slice(0, i + 1)];
            }),
        [],
    );

    // expose to children via context if desired
    useLayoutEffect(() => {
        document.documentElement.style.setProperty(
            "--rst-gap",
            `${gap}px`,
        );
    }, [gap]);

    const paneWidth =
        bounds.width >= minWidth * panes.length
            ? bounds.width / panes.length
            : minWidth;

    return (
        <div ref={ref} className="rst-Viewport">
            <div
                className="rst-Track"
                style={{
                    gap,
                }}
            >
                {panes.map((p) => (
                    <Pane key={p.id} width={paneWidth}>
                        {typeof p.element === "function"
                            ? (p.element as PaneRenderer)({ openPane })
                            : p.element}
                    </Pane>
                ))}
            </div>
        </div>
    );
}
