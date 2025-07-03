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
    /** Opens a new pane or navigates to an existing one by its ID */
    openPane(next: SlipStackPaneData): void;
}

export const SlipStackContainer = forwardRef<SlipStackHandle, Props>(
    function SlipStackContainer({paneData, paneWidth}: Props, ref): ReactNode {
        const [panes, setPanes] = useState<SlipStackPaneData[]>(paneData);
        const [viewportRef, bounds] = useMeasure();

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

        // Expose the openPane handler to external callers
        useImperativeHandle(ref, () => ({openPane}), [openPane]);

        // Configure spring animation starting at zero position
        // styles contains the animated values and api provides methods to control the animation
        const [styles, api] = useSpring(() => ({x: 0, immediate: true}));

        // Width of a single pane, capped at the larger of container width or passed value
        const maxPaneWidth = Math.min(paneWidth, bounds.width);

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
            ((((panes.length - 1) * maxPaneWidth) - bounds.width + tabWidth)) / (maxPaneWidth - tabWidth))
        );

        // Track how many tabs are collapsed on each side.
        const [leftTabCount, setLeftTabCount] = useState(initialTabCount);
        const [rightTabCount, setRightTabCount] = useState(0);

        // Intermediate state: currently dragging a left tab into view
        const [pinningLeft, setPinningLeft] = useState(false);

        // Reset tab counts whenever layout changes
        useEffect(() => {
            setLeftTabCount(initialTabCount);
            setRightTabCount(0);
            setPinningLeft(false);
        }, [initialTabCount, panes.length]);

        // Partition panes into their respective sections based on the current state.
        const leftTabs = pinningLeft
            ? panes.slice(1, leftTabCount)
            : panes.slice(0, leftTabCount);

        const [pinnedPane, ...trackPanes] = pinningLeft
            ? panes.slice(0, panes.length - rightTabCount)
            : panes.slice(leftTabCount, panes.length - rightTabCount);

        const rightTabs = panes.slice(panes.length - rightTabCount);

        useEffect(() => {
            api.start({x: 0, immediate: true});
        }, [paneData, api]);

        const offset = (bounds.width - (trackPanes.length * maxPaneWidth));
        const tabsWidth = (leftTabCount + rightTabCount) * tabWidth;
        const minTravel = pinningLeft ? -maxPaneWidth : 0;
        const maxTravel = maxPaneWidth + tabsWidth - offset;

        // ... (useWheel gesture handler)
        const bind = useWheel(({active, offset: [x], direction: [dx]}) => {
            // When scrolling to the right (revealing panes on the left)
            if (dx < 0) {
                // Begin pinning the left-most tab when at the start
                if (leftTabs.length > 0 && x <= 0 && !pinningLeft) {
                    setPinningLeft(true);
                    api.start({x: 0, immediate: active});
                    return;
                }
                // Once fully dragged over, convert the pinned tab to a right tab
                if (pinningLeft && x <= -maxPaneWidth) {
                    setPinningLeft(false);
                    setLeftTabCount(c => c - 1);
                    setRightTabCount(c => c + 1);
                    api.start({x: 0, immediate: active});
                    return;
                }
            }
            // When scrolling to the left (revealing panes on the right)
            if (dx > 0) {
                // Cancel pinning if not completed
                if (pinningLeft && x >= 0) {
                    setPinningLeft(false);
                    api.start({x: 0, immediate: active});
                    return;
                }
                // Convert a right tab back to a left one when reaching the end
                if (rightTabs.length > 0 && x >= maxTravel) {
                    setRightTabCount(c => c - 1);
                    setLeftTabCount(c => c + 1);
                    api.start({x: 0, immediate: active});
                    return;
                }
            }
            // Otherwise, update position of track
            api.start({x, immediate: active});
        }, {
            axis: "x",
            bounds: {left: minTravel, right: maxTravel},
        });

        const renderPane = (p: SlipStackPaneData, extraStyle?: CSSProperties) => (
            <SlipStackPane key={p.id} width={maxPaneWidth} style={extraStyle}>
                {typeof p.element === "function" ? (p.element as SlipStackPaneRenderer)({openPane}) : p.element}
            </SlipStackPane>
        );

        const renderTab = (p: SlipStackPaneData, side: "left" | "right") => (
            <SlipStackTab key={p.id} title={p.title} width={tabWidth} side={side}/>
        );

        return (
            <div
                {...bind()}
                ref={viewportRef}
                style={viewportStyle}
            >
                {leftTabs.map(tab => renderTab(tab, "left"))}

                {pinnedPane && renderPane(pinnedPane)}

                <animated.div
                    data-testid="track"
                    style={{
                        ...trackStyle,
                        left: styles.x.to(x => (leftTabs.length * tabWidth) + maxPaneWidth - x),
                        borderLeft: styles.x.to(x => (x !== 0 ? "1px solid rgba(0,0,0,0.05)" : "none")),
                        boxShadow: styles.x.to(x => (x !== 0 ? "-6px 0 15px -3px rgba(0,0,0,0.05)" : "none")),
                        willChange: styles.x.to(x => (x !== 0 ? "transform, box-shadow" : "auto")),
                    }}
                >
                    {trackPanes.map(p => renderPane(p))}
                </animated.div>

                <div style={{flexGrow: 1}}/>

                {rightTabs.map(tab => renderTab(tab, "right"))}
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";