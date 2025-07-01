import { CSSProperties, ReactNode, useCallback, useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";
import { VerticalTab } from "./VerticalTab";

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

const tabWidth = 40;

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

    const paneWidth = Math.min(width, bounds.width);

    let leftTabs = 0;
    let available = bounds.width;
    while (leftTabs < panes.length - 1) {
        const remaining = panes.length - leftTabs;
        const overflow = paneWidth * remaining - available;
        if (overflow <= paneWidth) break;
        leftTabs += 1;
        available -= tabWidth;
    }

    const tabs = panes.slice(0, leftTabs);
    const [first, ...rest] = panes.slice(leftTabs);

    const offset = Math.max(0, paneWidth * (rest.length) - (available - paneWidth));

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
            borderLeft: "1px solid rgba(0,0,0,0.05)",
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
            {tabs.map(t => (
                <VerticalTab key={t.id} title={t.title} width={tabWidth}/>
            ))}
            {first &&
                renderPane(first, offset > 0
                    ? {position: "absolute", left: leftTabs * tabWidth}
                    : {marginLeft: leftTabs * tabWidth})}
            <div
                data-testid="track"
                style={{...trackStyle, left: leftTabs * tabWidth + paneWidth, ...slideStyle}}
            >
                {rest.map(p => renderPane(p))}
            </div>
        </div>
    );
}
