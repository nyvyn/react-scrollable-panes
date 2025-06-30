import { CSSProperties, ReactNode, useCallback, useEffect, useState } from "react";
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
    width: minWidth,
}: Props): ReactNode {
    const [panes, setPanes] = useState<ScrollableTiledPaneData[]>(initial);
    const [viewportRef, bounds] = useMeasure();   // gives us bounds.width

    useEffect(() => {
        setPanes(initial);        // replace the stack with the new initial panes
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

    const paneWidth =
        bounds.width && panes.length * minWidth <= bounds.width
            ? Math.floor(bounds.width / panes.length)
            : minWidth;

    const totalWidth = minWidth * panes.length;   // used only for slide maths
    const offset = Math.max(0, totalWidth - bounds.width); // px to slide left

    const [first, ...rest] = panes;

    const renderPane = (
        p: ScrollableTiledPaneData,
        extraStyle: CSSProperties = {}
    ) => (
        <ScrollableTiledPane key={p.id} width={paneWidth} style={extraStyle}>
            {typeof p.element === "function"
                ? (p.element as ScrollableTiledPaneRenderer)({openPane})
                : p.element}
        </ScrollableTiledPane>
    );

    const slideStyle: CSSProperties = {
        transform: `translateX(-${offset}px)`,
        transition: 'transform 300ms ease-out',
        willChange: 'transform',
    };

    // Auto-scroll to reveal the newest pane
    useEffect(() => {
      const el = viewportEl.current;
      if (!el) return;
      const maxOffset = el.scrollWidth - el.clientWidth;
      if (maxOffset > 0)
        el.scrollTo({ left: maxOffset, behavior: "smooth" });
    }, [panes.length]);

    return (
        <div ref={viewportRef} style={viewportStyle}>
            {first && renderPane(first, offset > 0 ? { position: 'absolute' } : undefined)}
            <div
                data-testid="track"
                style={{ ...trackStyle, left: paneWidth, ...slideStyle }}
            >
                {rest.map((pane) => renderPane(pane))}
            </div>
        </div>
    );
}
