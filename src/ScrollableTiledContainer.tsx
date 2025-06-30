import { CSSProperties, ReactNode, useCallback, useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    display: "flex",
    flex: "1",
    width: "100%",
    overflow: "hidden",
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
    width: number;           // minimum width for a single pane (px)
}

ScrollableTiledContainer.displayName = "ScrollableTiledContainer";

export function ScrollableTiledContainer({
    initial,
    width,
}: Props): ReactNode {
    const [panes, setPanes] = useState<ScrollableTiledPaneData[]>(initial);
    const [viewportRef, bounds] = useMeasure();   // gives us bounds.width

    useEffect(() => {
        setPanes(initial);
    }, [initial]);

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

    const [first, ...rest] = panes;

    const paneWidth = Math.min(width, bounds.width);

    const offset = Math.max(0, paneWidth * panes.length - bounds.width);

    const renderPane = (p: ScrollableTiledPaneData, extraStyle?: CSSProperties) => (
        <ScrollableTiledPane key={p.id} width={paneWidth} style={extraStyle}>
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
            transition:
                "box-shadow 100ms linear, opacity 75ms linear, " +
                "transform 200ms cubic-bezier(0.19, 1, 0.22, 1)",
            willChange: "transform, opacity, box-shadow",
            opacity: 1,
            // shadow on the left side whenever the track has been shifted
            boxShadow: "0 0 15px 3px rgba(0,0,0,0.05)",
        }),
    };

    return (
        <div ref={viewportRef} style={viewportStyle}>
            {first && renderPane(first, offset > 0 ? {position: "absolute"} : undefined)}
            <div
                data-testid="track"
                style={{...trackStyle, left: width, ...slideStyle}}
            >
                {rest.map(p => renderPane(p))}
            </div>
        </div>
    );
}
