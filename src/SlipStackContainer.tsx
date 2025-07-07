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
import { SlipStackTab } from "@/SlipStackTab";
import { useMeasure } from "@/useMeasure";
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

        // Overlap is the extent that all panes together exceed the viewport width.
        const overlap = Math.max(0, Math.floor(viewportWidth - panes.length * maxPaneWidth) * -1);

        // Whenever overlap changes, scroll to keep the rightmost pane visible
        useEffect(() => {
            if (!viewportRef.current) return;
            viewportRef.current.scrollTo({left: overlap});
        }, [overlap, viewportRef]);

        const [scrollLeft, setScrollLeft] = useState(0);

        useEffect(() => {
            const handleScroll = () => {
                setScrollLeft(viewportRef.current?.scrollLeft ?? 0);
            };

            // Add the event listener when the component mounts
            viewportRef.current?.addEventListener("scroll", handleScroll);

            // Clean up the event listener when the component unmounts
            return () => {
                viewportRef.current?.removeEventListener("scroll", handleScroll);
            };
        }, []);

        // Display the pane with a tab positioned over it, opacity controls tab visibility.
        const renderPane = (p: SlipStackPaneData, index: number, style?: CSSProperties) => {
            /**
             * The formula calculates the exact scroll position where the next pane () begins to slide over the current pane (),
             * leaving only a portion of the current pane visible. If is greater than that position, we consider the current pane to be a 'left tab'.
             * If the right edge of the viewport has scrolled past the pane, leaving less than of the pane's left side visible,
             * then we consider this pane to be a 'right tab'."
             */
            const isLeftOccluded = scrollLeft > (index + 1) * (maxPaneWidth - tabWidth);
            const isRightOccluded = (scrollLeft + viewportWidth) < (index * maxPaneWidth + tabWidth);
            const isTab = isLeftOccluded || isRightOccluded;

            return (
                <div
                    key={p.id}
                    style={{
                        ...style,
                        borderLeft: index > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                        boxShadow: index > 0 ? "-6px 0 15px -3px rgba(0,0,0,0.05)" : "none",
                    }}
                >
                    <SlipStackPane
                        id={p.id}
                        width={maxPaneWidth}
                        style={{
                            position: "relative",
                        }}
                    >
                        {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane, closePane}) : p.element}
                    </SlipStackPane>
                    <SlipStackTab
                        title={p.title}
                        width={tabWidth}
                        side={isLeftOccluded ? "left" : isRightOccluded ? "right" : undefined}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            opacity: isTab ? 1 : 0,
                            transition: "opacity 150ms linear",
                        }}
                    />
                </div>
            );
        };

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
                    scrollBehavior: "smooth",
                }}
            >
                <div
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
                </div>
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";
