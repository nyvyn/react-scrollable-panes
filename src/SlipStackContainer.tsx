/**
 * A container component that manages a stack of horizontally sliding panes.
 * Handles pane navigation, responsive layout, and touch/mouse wheel interactions.
 * Automatically creates tabs when panes exceed available width.
 */
import { animated, useSpring } from "@react-spring/web";
import { useWheel } from "@use-gesture/react";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from "react";
import useMeasure from "react-use-measure";
import { SlipStackPane, SlipStackPaneData, SlipStackPaneRenderer } from "@/SlipStackPane";
import { SlipStackTab } from "@/SlipStackTab";

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
  function SlipStackContainer({ paneData, paneWidth }: Props, ref): ReactNode {
    const [panes, setPanes] = useState<SlipStackPaneData[]>(paneData);
    const [viewportRef, bounds] = useMeasure();

    // This provides updates when the pane array is updated.
    useEffect(() => {
        setPanes(paneData);
    }, [paneData]);

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

    useImperativeHandle(ref, () => ({ openPane }), [openPane]);

    // Configure spring animation starting at zero position
    // styles contains the animated values and api provides methods to control the animation
    const [styles, api] = useSpring(() => ({x: 0, immediate: true}));

    const [extraLeft, setExtraLeft] = useState(0);
    const [extraRight, setExtraRight] = useState(0);

    useEffect(() => {
        setExtraLeft(0);
        setExtraRight(0);
        api.start({x: 0, immediate: true});
    }, [paneData, api]);

    // Width of a single pane, capped at the larger of container width or passed value
    const maxWidth = Math.min(paneWidth, bounds.width);

    const baseLeft = Math.max(0, Math.ceil(((((panes.length - 1) * maxWidth) - bounds.width + tabWidth - 1)) / (maxWidth - tabWidth)));
    const leftCount = Math.min(panes.length - 1, baseLeft + extraLeft);
    const rightCount = Math.min(extraRight, Math.max(0, panes.length - leftCount - 1));
    const mainCount = Math.max(1, panes.length - leftCount - rightCount);

    // Available width for visible panes after accounting for tabs
    const available = bounds.width - (leftCount + rightCount) * tabWidth;
    // How much we need to offset visible panes to fit
    const trackOffset = Math.max(0, (maxWidth * mainCount) - available);

    // Set the wheel hook and define component movement based on gesture data
    const rightBound = maxWidth - trackOffset;
    const leftBound = -trackOffset;
    const bind = useWheel(({active, offset: [x], direction: [dx]}) => {
        // Branch for scrolling LEFT (dx < 0) – create a left tab
        if (
            x <= leftBound &&
            dx < 0 &&
            rightCount < panes.length - leftCount - 1
        ) {
            setExtraLeft(v  => v + 1);
            setExtraRight(v => v - 1);
            api.start({ x: 0, immediate: true });
            return;
        }
        // Branch for scrolling RIGHT (dx > 0) – create a right tab
        if (
          x >= rightBound &&
          dx > 0 &&
          leftCount < panes.length - rightCount - 1
        ) {
          setExtraRight(v => v + 1);
          setExtraLeft(v  => v - 1);
          api.start({ x: 0, immediate: true });
          return;
        }
        api.start({x, immediate: active});
    }, {
        axis: "x",
        bounds: {left: leftBound, right: rightBound},
    });

    // Tabs to show on left side
    const leftTabs = panes.slice(0, leftCount);
    // Split visible panes into pinned and rest
    const [pinnedPane, ...trackPanes] = panes.slice(leftCount, leftCount + mainCount);
    // Tabs to show on right side
    const rightTabs = panes.slice(leftCount + mainCount);

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

            {pinnedPane && renderPane(
                pinnedPane,
                trackOffset > 0 ? {position: "absolute", left: leftCount * tabWidth} : {marginLeft: leftCount * tabWidth}
            )}

            <animated.div
                data-testid="track"
                style={{
                    ...trackStyle,
                    left: styles.x.to(x => (leftCount * tabWidth) + maxWidth - x),
                    transform: `translateX(-${trackOffset}px)`,
                    // add animation helpers only when we are actually sliding
                    ...(trackOffset > 0 && {
                        borderLeft: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
                        transition: "transform 200ms cubic-bezier(0.19, 1, 0.22, 1)",
                        willChange: "transform, box-shadow",
                    })
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
