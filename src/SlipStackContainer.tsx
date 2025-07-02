import { CSSProperties, ReactNode, useCallback, useEffect, useState, } from "react";
import useMeasure from "react-use-measure";
import { SlipStackPane, SlipStackPaneData, SlipStackPaneRenderer } from "./SlipStackPane";
import { SlipStackTab } from "./SlipStackTab";

const viewportStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    flex: "1",
    width: "100%",
    overflow: "hidden",
};

const trackStyle: CSSProperties = {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    height: "100%",
};

const tabWidth = 40;

interface Props {
    initial: SlipStackPaneData[];
    width: number;
}

SlipStackContainer.displayName = "SlipStackContainer";

export function SlipStackContainer({
    initial, width,
}: Props): ReactNode {
    const [panes, setPanes] = useState<SlipStackPaneData[]>(initial);
    const [viewportRef, bounds] = useMeasure();

    // This provides updates when the pane array is updated.
    useEffect(() => {
        setPanes(initial);
    }, [initial]);

    /**
     *  Passed to every pane renderer so it can request navigation.
     *   – Appends the pane when its `id` is new.
     *   – Otherwise keeps panes up to (and including) the matching `id`,
     *     effectively replacing everything to its right.
     */
    const openPane = useCallback((next: SlipStackPaneData) => setPanes((prev) => {
        const i = prev.findIndex((p: { id: string; }) => p.id === next.id);
        return i === -1 ? [...prev, next] : [...prev.slice(0, i + 1)];
    }), [],);

    // Width of a single pane, capped at the larger of container width or passed value
    const paneWidth = Math.min(width, bounds.width);

    // Number of tabs to show on the left side
    // Calculated as the total number of panes, subtracting one which can be overlapped
    // Multiplied by the width of a pane, which is then subtracted from the width of the viewport + the width of a tab - 1px to account for borders
    // Then divided by the width of a pane subtracting the width of a tab, which accounts for the width of all left tabs
    const leftCount = Math.max(0, Math.ceil(((((panes.length - 1) * paneWidth) - bounds.width + tabWidth - 1)) / (paneWidth - tabWidth)));
    // Number of panes currently visible in viewport
    const mainCount = panes.length - leftCount;
    // Number of tabs to show on the right side
    const rightCount = Math.max(0, panes.length - leftCount - mainCount);

    // Available width for visible panes after accounting for tabs
    const available = bounds.width - (leftCount + rightCount) * tabWidth;
    // How much we need to offset visible panes to fit
    const offset = Math.max(0, paneWidth * mainCount - available);

    // Tabs to show on left side
    const leftTabs = panes.slice(0, leftCount);
    // Split visible panes into pinned and rest
    const [pinnedPane, ...trackPanes] = panes.slice(leftCount, leftCount + mainCount);
    // Tabs to show on right side
    const rightTabs = panes.slice(leftCount + mainCount);

    const slideStyle: CSSProperties = {
        // always reflect the *current* offset
        transform: `translateX(-${offset}px)`,

        // add animation helpers only when we are actually sliding
        ...(offset > 0 && {
            borderLeft: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
            transition: "transform 200ms cubic-bezier(0.19, 1, 0.22, 1)",
            willChange: "transform, box-shadow",
        }),
    };

    const renderPane = (p: SlipStackPaneData, extraStyle?: CSSProperties) => (
        <SlipStackPane key={p.id} width={paneWidth} style={extraStyle}>
            {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane}) : p.element}
        </SlipStackPane>
    );

    const renderTab = (p: SlipStackPaneData, side: "left" | "right") => (
        <SlipStackTab key={p.id} title={p.title} width={tabWidth} side={side}/>
    );

    return (
        <div
            ref={viewportRef}
            style={viewportStyle}
        >
            {leftTabs.map(p => renderTab(p, "left"))}

            {pinnedPane && renderPane(
                pinnedPane,
                offset > 0 ? {position: "absolute", left: leftCount * tabWidth} : {marginLeft: leftCount * tabWidth}
            )}

            <div
                data-testid="track"
                style={{
                    ...trackStyle,
                    left: leftCount * tabWidth + paneWidth,
                    ...slideStyle
                }}
            >
                {trackPanes.map(p => renderPane(p))}
            </div>

            <div style={{flexGrow: 1}}/>

            {rightTabs.map(p => renderTab(p, "right"))}
        </div>
    );
}
