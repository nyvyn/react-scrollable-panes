/**
 * A container component that manages a stack of horizontally sliding panes.
 * Handles pane navigation, responsive layout, and touch/mouse wheel interactions.
 * Automatically creates tabs when panes exceed available width.
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
        const maxWidth = Math.min(paneWidth, bounds.width);

        // Base left is calculated to show the max number of panes plus one overlap
        const baseLeft = Math.max(0, Math.ceil(
            ((((panes.length - 1) * maxWidth) - bounds.width + tabWidth - 1)) / (maxWidth - tabWidth))
        );

        // -n = n extra-left,  +n = n extra-right
        const [extraTabs, setExtraTabs] = useState(-baseLeft);

        // When the layout changes, the number of items that overflow will
        // change, so we need to reset the extras.
        useEffect(() => {
            setExtraTabs(-baseLeft);
        }, [baseLeft]);

        // Normalize the extras, inverting the negative left extra to be positive.
        const leftExtra = extraTabs < 0 ? extraTabs * -1 : 0;
        const rightExtra = extraTabs > 0 ? extraTabs : 0;

        const leftCount = Math.min(panes.length - 1, leftExtra);
        const rightCount = Math.min(rightExtra, Math.max(0, panes.length - leftCount - 1));
        const mainCount = Math.max(1, panes.length - leftCount - rightCount);

        // Tabs to show on left side
        const leftTabs = panes.slice(0, leftCount);
        // Split visible panes into pinned and rest
        const [pinnedPane, ...trackPanes] = panes.slice(leftCount, leftCount + mainCount);
        // Tabs to show on right side
        const rightTabs = panes.slice(leftCount + mainCount);

        useEffect(() => {
            api.start({x: 0, immediate: true});
        }, [paneData, api]);

        // Set the wheel hook and define component movement based on gesture data
        const minTravel = 0;
        // The track can scroll from 0 to its full width minus the visible area.
        const maxTravel = Math.max(0, (trackPanes.length * maxWidth) - (bounds.width - maxWidth) + (leftCount * tabWidth));
        const bind = useWheel(({active, offset: [x], direction: [dx]}) => {
            // When scrolling to the right (revealing panes on the left), and we
            // are at the start, convert a left tab back into the pinned pane.
            if (x <= minTravel && dx < 0) {
                setExtraTabs(t => t + 1);
                api.start({x: 0, immediate: active});
                return;
            }
            // When scrolling to the left (revealing panes on the right), and we
            // are at the end, convert the pinned pane into a left tab.
            if (x >= maxTravel && dx > 0) {
                setExtraTabs(t => t - 1);
                api.start({x: 0, immediate: active});
                return;
            }
            // Otherwise, update position of track
            api.start({x, immediate: active});
        }, {
            axis: "x",
            bounds: {left: minTravel, right: maxTravel},
        });

        const renderPane = (p: SlipStackPaneData, extraStyle?: CSSProperties) => (
            <SlipStackPane key={p.id} width={maxWidth} style={extraStyle}>
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
                {leftTabs.map(p => renderTab(p, "left"))}

                {pinnedPane && renderPane(pinnedPane)}

                <animated.div
                    data-testid="track"
                    style={{
                        ...trackStyle,
                        left: styles.x.to(x => (leftCount * tabWidth) + maxWidth - x),
                        borderLeft: styles.x.to(x => (x !== 0 ? "1px solid rgba(0,0,0,0.05)" : "none")),
                        boxShadow: styles.x.to(x => (x !== 0 ? "-6px 0 15px -3px rgba(0,0,0,0.05)" : "none")),
                        willChange: styles.x.to(x => (x !== 0 ? "transform, box-shadow" : "auto")),
                    }}
                >
                    {trackPanes.map(p => renderPane(p))}
                </animated.div>

                <div style={{flexGrow: 1}}/>

                {rightTabs.map(p => renderTab(p, "right"))}
            </div>
        );
    });
SlipStackContainer.displayName = "SlipStackContainer";