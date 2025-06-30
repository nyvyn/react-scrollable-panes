import { ReactNode, useCallback, useLayoutEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { PaneData, PaneRenderer, ScrollableTiledPane } from "./ScrollableTiledPane";

interface Props {
    initial: PaneData[];
    minWidth?: number; // px
}

ScrollableTiledContainer.displayName = "ScrollableTiledContainer";

export function ScrollableTiledContainer({
    initial,
    minWidth = 380,
}: Props): ReactNode {
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


    const paneWidth =
        bounds.width >= minWidth * panes.length
            ? bounds.width / panes.length
            : minWidth;

    return (
        <div ref={ref} className="rst-Viewport">
            <div
                className="rst-Track"
            >
                {panes.map((p) => (
                    <ScrollableTiledPane key={p.id} width={paneWidth}>
                        {typeof p.element === "function"
                            ? (p.element as PaneRenderer)({openPane})
                            : p.element}
                    </ScrollableTiledPane>
                ))}
            </div>
        </div>
    );
}
