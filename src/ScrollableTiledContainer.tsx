import { CSSProperties, ReactNode, useCallback, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    display: "flex",
    flex: "1",
    width: "100%",
    overflow: "hidden",
    border: "1px solid yellow",
    position: "relative",
};

const trackStyle: CSSProperties = {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    height: "100%",
};

interface Props {
    initial: ScrollableTiledPaneData[];
    width: number; // px
}

ScrollableTiledContainer.displayName = "ScrollableTiledContainer";

export function ScrollableTiledContainer({
    initial,
    width,
}: Props): ReactNode {
    const [panes, setPanes] = useState<ScrollableTiledPaneData[]>(initial);
    const [viewportRef, bounds] = useMeasure();   // gives us bounds.width

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

    const totalWidth = width * panes.length;
    const offset = Math.max(0, totalWidth - bounds.width); // px to slide left

    const [first, ...rest] = panes;

    const renderPane = (p: ScrollableTiledPaneData) => (
        <ScrollableTiledPane key={p.id} width={width}>
            {typeof p.element === "function"
                ? (p.element as ScrollableTiledPaneRenderer)({openPane})
                : p.element}
        </ScrollableTiledPane>
    );

    const slideStyle: CSSProperties = {
        // always reflect the *current* offset
        transform: `translateX(-${offset}px)`,

        // add animation helpers only when we are actually sliding
        ...(offset > 0 && {
            transition: 'transform 300ms ease-out',
            willChange: 'transform',
        }),
    };

    return (
        <div ref={viewportRef} style={viewportStyle}>
            {first && (
                renderPane(first)
            )}
            <div
                data-testid="track"
                style={{ ...trackStyle, left: width, ...slideStyle }}
            >
                {rest.map(renderPane)}
            </div>
        </div>
    );
}
