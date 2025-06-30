import { CSSProperties, ReactNode, useCallback, useState, useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";

const viewportStyle: CSSProperties = {
    display: "flex",
    flex: "1",
    overflowX: "auto",
    overflowY: "hidden",
    border: "1px solid yellow",
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
    const viewportEl = useRef<HTMLDivElement | null>(null);
    const [measureRef, bounds] = useMeasure();
    const combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        measureRef(node);
        viewportEl.current = node;
      },
      [measureRef],
    );

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

    // Auto-scroll to reveal the newest pane
    useEffect(() => {
      const el = viewportEl.current;
      if (!el) return;
      const maxOffset = el.scrollWidth - el.clientWidth;
      if (maxOffset > 0)
        el.scrollTo({ left: maxOffset, behavior: "smooth" });
    }, [panes.length]);

    return (
        <div ref={combinedRef} style={viewportStyle}>
            <div style={trackStyle}>
                {panes.map((p) => (
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
