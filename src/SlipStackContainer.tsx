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
import { animated, useSpring } from "@react-spring/web";
import { useMeasure } from "@uidotdev/usehooks";
import { useWheel } from "@use-gesture/react";
import { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState, createRef, useMemo } from "react";
import { useOverlap } from "@/useOverlap";

const DEBUG = true;

const tabWidth = 40;

/**
 * Props for the SlipStackContainer component
 */
interface Props {
    /** Set of panes to layout in the container (a mix of tabs and panes based on widths) */
    paneData: SlipStackPaneData[];
    /** Maximum width in pixels for each individual pane */
    paneWidth: number;
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
    function SlipStackContainer({paneData, paneWidth}: Props, ref): ReactNode {
        const [panes, setPanes] = useState<SlipStackPaneData[]>(paneData);

        // Refs for each pane so we can detect overlap
        const paneRefs = useMemo(
            () => panes.map(() => createRef<HTMLDivElement>()),
            [panes],
        );

        const overlaps = useOverlap(paneRefs);

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

        // Boundaries for the track
        const minBound = overlap;
        const maxBound = 0;

        // The first render, panes is empty, so no positioning is applied
        const [styles, api] = useSpring(() => ({x: 0}));

        // When panes are updated, move them to overlap.
        useEffect(() => {
            api.start({x: overlap, immediate: false});
        }, [panes, api, overlap]);

        /**
         *  The wheel handler is set to the viewport to enable capturing events over the entire component.
         */
        const bind = useWheel(({offset: [x]}) => {
            const cx = (x: number) => {
                // this normalizes "x" based on the negative left
                return overlap - x;
            };

            // Otherwise, update position of track
            api.start({x: cx(x), immediate: true});
        }, {
            axis: "x",
            bounds: {left: minBound, right: maxBound},
            preventDefault: true,
            threshold: 0,
        });

        const renderPane = (p: SlipStackPaneData, i: number, extraStyle?: CSSProperties) => (
            <SlipStackPane
                key={p.id}
                ref={paneRefs[i]}
                width={maxPaneWidth}
                isOverlapping={overlaps[i]?.some(Boolean)}
                style={extraStyle}
            >
                {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane, closePane}) : p.element}
            </SlipStackPane>
        );

        return (
            <div
                {...bind()}
                id="slipstack-viewport"
                ref={viewportRef}
                data-testid="viewport"
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <animated.div
                    key={"slipstack-track"}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                        marginLeft: styles.x.to(x => x),
                    }}
                >
                    {panes.map((p, index) => renderPane(p, index, {
                        position: "sticky",
                        left: index * tabWidth,
                        right: (panes.length - index) * tabWidth - maxPaneWidth,
                    }))}
                </animated.div>

                {DEBUG && (<animated.div style={{position: "absolute", bottom: 0}}>
                    {styles.x.to(x => `
                        x: ${(x).toFixed(0)}
                        Min: ${minBound}
                        Max: ${maxBound}
                        Overlap: ${overlap}
                        Bounds: ${viewportWidth}
                        Panes: ${panes.length}
                    `)}
                </animated.div>)}
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";
