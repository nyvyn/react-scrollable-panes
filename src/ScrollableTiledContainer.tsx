import { CSSProperties, ReactNode, useCallback, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    display: "flex",
    flex: "1",
    overflowX: "hidden",
    overflowY: "hidden",
    border: "1px solid yellow",
    position: "relative", // allow panes to be absolutely positioned
};

const trackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  height: "100%",
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

    // Decide pane width:
    // • If all panes fit at minWidth, spread them evenly.
    // • Otherwise fall back to minWidth.
    const paneWidth =
      bounds.width && panes.length * minWidth <= bounds.width
        ? Math.floor(bounds.width / panes.length)
        : minWidth;

    const totalWidth = paneWidth * panes.length;
    const offset = Math.max(0, totalWidth - bounds.width);   // px to slide left

    const [first, ...rest] = panes;
    const firstPeek = 60; // px of the first pane to keep visible when overlapped

    return (
        <div ref={viewportRef} style={viewportStyle}>
            {offset > 0 && first && (
                <ScrollableTiledPane
                    key={first.id}
                    width={paneWidth}
                    style={panes.length > 1
                      ? {
                          position: "absolute",
                          left: Math.max(-paneWidth, -offset + firstPeek),
                          zIndex: 1,
                        }
                      : undefined}
                >
                    {typeof first.element === "function"
                      ? (first.element as ScrollableTiledPaneRenderer)({ openPane })
                      : first.element}
                </ScrollableTiledPane>
            )}
            <div
              style={{
                ...trackStyle,
                transform: `translateX(-${offset}px)`,
                transition: "transform 0.3s ease-out",
              }}
            >
                {(offset > 0 ? rest : panes).map((p) => (
                  <ScrollableTiledPane key={p.id} width={paneWidth}>
                    {typeof p.element === "function"
                      ? (p.element as ScrollableTiledPaneRenderer)({ openPane })
                      : p.element}
                  </ScrollableTiledPane>
                ))}
            </div>
        </div>
    );
}
