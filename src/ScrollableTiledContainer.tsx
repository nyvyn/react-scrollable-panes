import { CSSProperties, ReactNode, useCallback, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    display: "flex",
    flex: "1",
    overflow: "hidden",
    border: "1px solid yellow",
};

const trackStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    border: "1px solid red",
};

interface Props {
    initial: ScrollableTiledPaneData[];
    minWidth: number; // px
}

ScrollableTiledContainer.displayName = "ScrollableTiledContainer";

export function ScrollableTiledContainer({
    initial,
    minWidth,
}: Props): ReactNode {
    const [panes, setPanes] = useState<ScrollableTiledPaneData[]>(initial);
    const [ref, bounds] = useMeasure();

    /**
     *  Passed to every pane renderer so it can request navigation.
     *   – Appends the pane when its `id` is new.
     *   – Otherwise keeps panes up to (and including) the matching `id`,
     *     effectively replacing everything to its right.
     */
    const openPane = useCallback(
        (next: ScrollableTiledPaneData) =>
            setPanes((prev) => {
                const i = prev.findIndex((p: { id: string; }) => p.id === next.id);
                return i === -1 ? [...prev, next] : [...prev.slice(0, i + 1)];
            }),
        [],
    );

    const paneWidth = minWidth;
    const slots = Math.max(1, Math.floor(bounds.width / paneWidth));

    return (
        <div ref={ref} style={viewportStyle}>
            <div style={trackStyle}>
                {panes.map((p, i) => {
                    const slot = i % slots; // 0 … slots-1
                    return (
                        <ScrollableTiledPane
                            key={p.id}
                            width={paneWidth}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: slot * paneWidth,
                                zIndex: i + 1, // newer panes sit on top
                            }}
                        >
                            {typeof p.element === "function"
                                ? (p.element as ScrollableTiledPaneRenderer)({openPane})
                                : p.element}
                        </ScrollableTiledPane>
                    );
                })}
            </div>
        </div>
    );
}
