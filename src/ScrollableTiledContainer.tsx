import { CSSProperties, ReactNode, useCallback, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    width: "100%",
    overflowX: "auto",
    boxSizing: "border-box",
};

const trackStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 0,
    minHeight: "100%",
};

interface Props {
    initial: ScrollableTiledPaneData[];
    minWidth?: number; // px
}

ScrollableTiledContainer.displayName = "ScrollableTiledContainer";

export function ScrollableTiledContainer({
    initial,
    minWidth = 380,
}: Props): ReactNode {
    const [panes, setPanes] = useState<ScrollableTiledPaneData[]>(initial);
    const [ref, bounds] = useMeasure();

    // adds or replaces the rightmost pane
    const openPane = useCallback(
        (next: ScrollableTiledPaneData) =>
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
        <div ref={ref} style={viewportStyle}>
            <div style={trackStyle}>
                {panes.map((p) => (
                    <ScrollableTiledPane key={p.id} width={paneWidth}>
                        {typeof p.element === "function"
                            ? (p.element as ScrollableTiledPaneRenderer)({openPane})
                            : p.element}
                    </ScrollableTiledPane>
                ))}
            </div>
        </div>
    );
}
