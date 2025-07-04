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
import { useWheel } from "@use-gesture/react";
import { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useState } from "react";
import useMeasure from "react-use-measure";

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

        // Width of a single pane, capped at the larger of container width or passed value
        const maxPaneWidth = Math.min(paneWidth, viewportBounds.width);

        // Calculate how many panes must be converted to tabs to fit in the container.
        // The logic divides the total overflow width (numerator) by the net space gained
        // for each pane that is converted into a tab (denominator).
        //
        // The `tabWidth` is in the denominator because replacing a full pane (`maxPaneWidth`)
        // with a tab still leaves the tab itself consuming `tabWidth` pixels, so the net
        // space saved is `maxPaneWidth - tabWidth`.
        //
        // `tabWidth` is also used in the numerator's adjustment to ensure that even a
        // fractional overflow correctly rounds up to create the required number of tabs.
        const initialTabCount = Math.max(0, Math.ceil(
            ((((panes.length - 1) * maxPaneWidth) - viewportBounds.width + tabWidth)) / (maxPaneWidth - tabWidth))
        );

        // Intermediate state: currently dragging a left tab into view
        const [tabRefuge, setTabRefuge] = useState(false);
        const [tabOffset, setTabOffset] = useState(0);

        // Track how many tabs are collapsed on each side.
        const leftTabCount = initialTabCount - tabOffset - (tabRefuge ? 1 : 0);
        const rightTabCount = tabOffset;

        // Partition panes into their respective sections based on the current state.
        const leftTabs = panes.slice(0, leftTabCount);
        const [pinnedPane, ...trackPanes] = panes.slice(leftTabCount, panes.length - rightTabCount);
        const rightTabs = panes.slice(panes.length - rightTabCount);

        // How far to the right the track should be pushed to accommodate the tabs and pinned pane
        const trackOffset = leftTabs.length * tabWidth + maxPaneWidth;

        // Overlap is the viewport width subtracting the visible track width and tab width
        const overlap = Math.min(0,
            Math.floor(viewportBounds.width) -
            (leftTabCount + rightTabCount) * tabWidth -
            (panes.length - leftTabCount - rightTabCount) * maxPaneWidth);

        // Boundaries for the track
        const minBound = tabRefuge ? -(maxPaneWidth - tabWidth) : overlap;
        const maxBound = tabRefuge ? overlap : 0;

        // Configure spring animation starting at zero position
        // styles contains the animated values and api provides methods to control the animation
        const [styles, api] = useSpring(() => ({x: 0}));

        useEffect(() => {
            console.log("overlap", overlap);
            api.start({x: overlap, immediate: false});
        }, [panes, api]);

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
        const bind = useWheel(({active, offset: [x], direction: [dx]}) => {
            const cx = (x: number) => {
                // this normalizes "x" based on the negative left
                const adjustedX = overlap - x;
                return Math.max(minBound, Math.min(maxBound, adjustedX));
            };

            const debug = () => {
                if (DEBUG) console.log("x, cx, overlap, min, max", x, cx(x), overlap, minBound, maxBound);
            };

            // When scrolling to the right (revealing panes on the left)
            if (dx < 0) {
                // Begin providing refuge to the left-most tab when all the way to the right
                if (!tabRefuge && leftTabCount > 0 && cx(x) >= 0) {
                    debug();
                    setTabRefuge(true);
                    // api.start({x: cx(-maxPaneWidth), immediate: true});
                    return;
                }
                // When the rightmost pane would be hidden, convert it to a right-tab.
                if (tabRefuge && cx(x) >= overlap) {
                    debug();
                    setTabRefuge(false);
                    setTabOffset(t => t + 1);
                    // api.start({x: cx(x), immediate: true});
                    return;
                }
            }

            // When scrolling to the left (revealing panes on the right)
            if (dx > 0) {
                // When only rightmost pane is fully showing, pull the next tab into the refuge
                if (!tabRefuge && rightTabCount > 0 && cx(x) <= overlap) {
                    debug();
                    setTabRefuge(true);
                    setTabOffset(t => t - 1);
                    // api.start({x: cx(overlap), immediate: true});
                    return;
                }
                // When only a tabs-width of the refuge pane is showing, convert to left-tab
                if (tabRefuge && cx(x) <= -(maxPaneWidth - tabWidth)) {
                    debug();
                    setTabRefuge(false);
                    // api.start({x: cx(maxPaneWidth), immediate: true});
                    return;
                }
            }

            // Otherwise, update position of track
            api.start({x: cx(x), immediate: active});
        }, {
            axis: "x",
            preventDefault: true,
            threshold: 0,
        });

        const renderPane = (p: SlipStackPaneData, extraStyle?: CSSProperties) => (
            <SlipStackPane key={p.id} width={maxPaneWidth} style={extraStyle}>
                {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane, closePane}) : p.element}
            </SlipStackPane>
        );

        const renderTab = (p: SlipStackPaneData, side: "left" | "right") => (
            <SlipStackTab key={p.id} title={p.title} width={tabWidth} side={side}/>
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
                    overscrollBehaviorX: "contain"
                }}
            >
                <div
                    id="left-tab-stack"
                    style={{
                        position: "absolute",
                        display: "flex",
                        left: 0
                    }}
                >
                    {leftTabs.map(tab => renderTab(tab, "left"))}
                </div>

                {pinnedPane && renderPane(pinnedPane, {
                    position: "absolute",
                    left: leftTabs.length * tabWidth
                })}

                <animated.div
                    id="slipstack-track"
                    style={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                        left: styles.x.to(x => trackOffset + x),
                        borderLeft: styles.x.to(x => (x !== 0 ? "1px solid rgba(0,0,0,0.05)" : "none")),
                        boxShadow: styles.x.to(x => (x !== 0 ? "-6px 0 15px -3px rgba(0,0,0,0.05)" : "none")),
                    }}
                >
                    {trackPanes.map(p => renderPane(p))}
                </animated.div>

                <div
                    id="right-tab-stack"
                    style={{
                        position: "absolute",
                        display: "flex",
                        right: 0
                    }}
                >
                    {rightTabs.map(tab => renderTab(tab, "right"))}
                </div>

                {DEBUG && (<animated.div style={{position: "absolute", bottom: 0}}>
                    {styles.x.to(x => `
                        x: ${(x).toFixed(0)}
                        Min: ${overlap}
                        Max: ${maxBound}
                        Overlap: ${overlap}
                        Refuge: ${tabRefuge}
                        Bounds: ${viewportBounds.width}
                    `)}
                </animated.div>)}
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";
