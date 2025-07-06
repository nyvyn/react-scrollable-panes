/**
 *  A container component that manages a stack of horizontally sliding panes.
 *  Handles pane navigation, responsive layout, and touch/mouse wheel interactions.
 *
 *  Slip stack behavior
 *
 *  Fixed-width panes line up horizontally.
 *  New panes are inserted to the far right of the list of horizontal panes.
 *  If the width of this track of panes exceeds the viewport,
 *  then the left-most pane is converted to a vertical tab.
 *  Additionally, the first pane in the horizontal track of panes is fixed to the left margin.
 *  The remaining set of visible panes can slide over the first pinned pane.
 *  Scrolling the track to the right can convert the leftmost pane into the now new pinned pane,
 *  with the rightmost pane in the track converted to a right-aligned vertical tab.
 */
import { SlipStackPane, SlipStackPaneData, SlipStackPaneRenderer } from "@/SlipStackPane";
import { useMeasure } from "@/useMeasure";
import { animated } from "@react-spring/web";
import { useScroll } from "@use-gesture/react";
import { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from "react";

/**
 * Props for the SlipStackContainer component
 */
interface Props {
    /** Set of panes to layout in the container (a mix of tabs and panes based on widths) */
    paneData: SlipStackPaneData[];
    /** Maximum width in pixels for each pane */
    paneWidth?: number;
    /** Maximum width in pixels for each tab */
    tabWidth?: number;
}

/**
 * Imperative handle for controlling the SlipStackContainer from a parent component
 */
export interface SlipStackHandle {
    /** Opens a new pane or navigates to an existing one by its identifier */
    openPane(next: SlipStackPaneData): void;

    /** Closes a pane by its identifier */
    closePane(id: string): void;
}

export const SlipStackContainer = forwardRef<SlipStackHandle, Props>(
    function SlipStackContainer({paneData, paneWidth = 500, tabWidth = 40}: Props, ref): ReactNode {
        const [panes, setPanes] = useState<SlipStackPaneData[]>(paneData);

        // This provides updates when the pane array is updated.
        useEffect(() => {
            setPanes(paneData);
        }, [paneData]);

        /**
         *  Passed to every pane renderer so it can request navigation.
         *   - Appends the pane when its `id` is new.
         *   - Moves existing pane to the end when its `id` is found.
         */
        const openPane = useCallback((next: SlipStackPaneData) => setPanes((prev) => {
            const i = prev.findIndex((p: { id: string; }) => p.id === next.id);
            return i === -1 ? [...prev, next] : [...prev.filter(p => p.id !== next.id), next];
        }), [],);

        /**
         *  Removes the pane with the specified id from the list of panes.
         */
        const closePane = useCallback((id: string) => {
            setPanes((prev) => prev.filter((p) => p.id !== id));
        }, []);

        // Expose the openPane and closePane handlers to external callers
        useImperativeHandle(ref, () => ({openPane, closePane}), [openPane, closePane]);

        // Width of viewport
        const [viewportRef, viewportBounds] = useMeasure();
        const viewportWidth = viewportBounds.width ?? 0;

        // Width of a single pane, capped at the larger of container width or passed value
        const maxPaneWidth = Math.min(paneWidth, viewportWidth);

        // Overlap is the viewport width subtracting the visible track width and tab width
        const overlap = Math.min(0, Math.floor(viewportWidth - panes.length * maxPaneWidth));

        // Scroll position of the viewport
        const [scrollX, setScrollX] = useState(0);
        useScroll(({ scroll: [x] }) => setScrollX(x), { target: viewportRef });

        // Whenever panes or overlap change, scroll to keep the rightmost pane visible
        useEffect(() => {
            if (!viewportRef.current) return;
            viewportRef.current.scrollLeft = -overlap;
        }, [overlap, panes, viewportRef]);

        const renderPane = (p: SlipStackPaneData, index: number, style?: CSSProperties) => (
            <SlipStackPane
                key={p.id}
                id={p.id}
                width={maxPaneWidth}
                style={{...style, position: "relative"}}
                title={p.title}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: tabWidth,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        writingMode: "vertical-rl",
                        opacity: scrollX > index * maxPaneWidth ? 1 : 0,
                        transition: "opacity 0.2s",
                        pointerEvents: "none",
                    }}
                >
                    {p.title}
                </div>
                {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane, closePane}) : p.element}
            </SlipStackPane>
        );

        return (
            <div
                ref={viewportRef}
                id="slipstack-viewport"
                data-testid="slipstack-viewport"
                className="slipstack-viewport"
                style={{
                    position: "relative",
                    display: "flex",
                    flexGrow: 1,
                    width: "100%",
                    height: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    overscrollBehavior: "contain",
                    touchAction: "pan-y",
                }}
            >
                <animated.div
                    id="slipstack-track"
                    data-testid="slipstack-track"
                    className="slipstack-track"
                    style={{
                        width: panes.length * maxPaneWidth,
                        display: "flex",
                        flexGrow: 1,
                    }}
                >
                    {panes.map((p, index) => renderPane(p, index, {
                        position: "sticky",
                        left: index * tabWidth,
                        right: -(maxPaneWidth - ((panes.length - index) * tabWidth)),
                    }))}
                </animated.div>
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";
