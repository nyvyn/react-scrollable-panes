import {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useState,
    WheelEvent,
} from "react";
import useMeasure from "react-use-measure";
import { ScrollableTiledPane, ScrollableTiledPaneData, ScrollableTiledPaneRenderer } from "./ScrollableTiledPane";
import { VerticalTab } from "./VerticalTab";

const viewportStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    flex: "1",
    width: "100%",
    overflow: "hidden",                // keep clipping everything
    scrollSnapType: "x mandatory",     // activate horizontal snap
    scrollBehavior: "smooth",          // smooth programmatic motion
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
    const [viewIndex, setViewIndex] = useState(0);

    useEffect(() => {
        setPanes(initial);
        setViewIndex(0);
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

    const maxVisible = Math.max(1, Math.min(panes.length, Math.floor((bounds.width + (paneWidth - tabWidth)) / paneWidth)));

    useEffect(() => {
        setViewIndex((idx) => Math.min(Math.max(0, panes.length - maxVisible), idx));
    }, [maxVisible]);

    // keep newest panes visible
    useEffect(() => {
        setViewIndex(panes.length - maxVisible);
    }, [panes.length, maxVisible]);

    const leftTabs = viewIndex;
    let visibleCount = Math.max(0, Math.min(maxVisible, panes.length - leftTabs));
    let rightTabs = Math.max(0, panes.length - leftTabs - visibleCount);

    let available = bounds.width - (leftTabs + rightTabs) * tabWidth;
    let offset = paneWidth * visibleCount - available;

    while (offset <= -(paneWidth - tabWidth) && (visibleCount > 1 || leftTabs > 0)) {
        visibleCount -= 1;
        rightTabs += 1;
        available = bounds.width - (leftTabs + rightTabs) * tabWidth;
        offset = paneWidth * visibleCount - available;
    }

    offset = Math.max(offset, -(paneWidth - tabWidth));
    if (leftTabs === 0 && offset < 0) offset = 0;

    const tabs = panes.slice(0, leftTabs);
    const visible = panes.slice(leftTabs, leftTabs + visibleCount);
    const [first, ...rest] = visible;

    const renderPane = (p: ScrollableTiledPaneData, extraStyle?: CSSProperties) => (
        <ScrollableTiledPane key={p.id} width={paneWidth} style={extraStyle}>
            {typeof p.element === "function"
                ? (p.element as ScrollableTiledPaneRenderer)({openPane})
                : p.element}
        </ScrollableTiledPane>
    );

    const slideStyle: CSSProperties = {
        // always reflect the *current* offset
        transform: `translateX(${ -offset }px)`,

        // add animation helpers only when we are actually sliding
        ...(offset > 0 && {
            borderLeft: "1px solid rgba(0,0,0,0.05)",
            transition:
                "box-shadow 100ms linear, opacity 75ms linear, " +
                "transform 200ms cubic-bezier(0.19, 1, 0.22, 1)",
            willChange: "transform, opacity, box-shadow",
            opacity: 1,
            // shadow on the left side whenever the track has been shifted
            boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
        }),
    };

    const rightTabsElements = panes.slice(leftTabs + visibleCount).map(t => (
        <VerticalTab key={t.id} title={t.title} width={tabWidth} side="right" />
    ));

    return (
        <div
            ref={viewportRef}
            style={viewportStyle}
            onWheel={(e: WheelEvent<HTMLDivElement>) => {
                if (e.deltaX > 0 || e.deltaY > 0) {
                    setViewIndex((v) => Math.min(panes.length, v + 1));
                } else if (e.deltaX < 0 || e.deltaY < 0) {
                    setViewIndex((v) => Math.max(0, v - 1));
                }
            }}
        >
            {tabs.map(t => (
                <VerticalTab key={t.id} title={t.title} width={tabWidth} />
            ))}
            {first &&
                renderPane(first, offset > 0
                    ? { position: "absolute", left: leftTabs * tabWidth }
                    : { marginLeft: leftTabs * tabWidth })}
            <div
                data-testid="track"
                style={{ ...trackStyle, left: leftTabs * tabWidth + paneWidth, ...slideStyle }}
            >
                {rest.map(p => renderPane(p))}
            </div>
            <div style={{ flexGrow : 1 }}/>
            {rightTabsElements}
        </div>
    );
}
