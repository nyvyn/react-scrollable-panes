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
import { animated, useSpring } from "@react-spring/web";
import { useMeasure } from "@uidotdev/usehooks";
import { useWheel } from "@use-gesture/react";
import { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from "react";

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

        // Configure spring animation starting at zero position
        // styles contains the animated values and api provides methods to control the animation
        const [styles, api] = useSpring(() => ({x: 0}));

        useEffect(() => {
            api.start({x: overlap, immediate: false});
        }, [panes, api, overlap]);

        /**
         *  The wheel handler is set to the viewport to enable capturing events over the entire component.
         *  The only part that scrolls is the track, and it only scrolls horizontally.
         *  The left tabs are left-aligned, the right the opposite with a flex spacer in between to fill.
         *  If there is at least one pane, then the first pane that's not a tab is pinned, absolute positioned.
         *  If there is more than one pane visible, then those belong to the track.
         *
         *  "X" only applies to the track, and if there's a track, then there is one pinned pane.
         *  "X" is zero when the left edge of the track touches the right edge of the pinned pane.
         *  The sliding effect is determined by a negative left margin equal to the overlap -
         *  which is the amount of track that overlaps the right edge of the viewport (hidden).
         *
         *  When a tab is to be removed, it moves to the tab refuge, which fills the position of the pinned pane.
         *  (if there was already a pinned pane, it now joins the track).
         *  To appear as though the previously pinned pane joined the track in place, "X" must be adjusted
         *  to the left equal to the width of a pane subtracting the width of the tab that no longer exists.
         *
         *  When there is at least one tab, and none in the refuge, then dragging the track to position zero
         *  (which is the right side of the pinned pane connected to the left side of the track)
         *  and the refuge is activated.
         *
         *  To push a tab from the refuge to the left, "X" needs to meet or exceed the overlap
         *  (sliding over the pinned pane).
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

        const renderPane = (p: SlipStackPaneData, extraStyle?: CSSProperties) => (
            <SlipStackPane key={p.id} width={maxPaneWidth} style={extraStyle}>
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
                    {panes.map((p, index) => renderPane(p, {
                        position: "sticky",
                        left: index * tabWidth,
                        right: (panes.length - index) * tabWidth - maxPaneWidth,
                        borderLeft: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: index > 0 && overlap < 0 ? "-6px 0 15px -3px rgba(0,0,0,0.05)" : "none",
                    }))}
                </animated.div>

                {DEBUG && (<animated.div style={{position: "absolute", bottom: 0}}>
                    {styles.x.to(x => `
                        x: ${(x).toFixed(0)}
                        Min: ${minBound}
                        Max: ${maxBound}
                        Overlap: ${overlap}
                        Bounds: ${viewportBounds.width}
                        Panes: ${panes.length}
                    `)}
                </animated.div>)}
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";
