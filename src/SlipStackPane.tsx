import { CSSProperties, forwardRef, PropsWithChildren, ReactNode } from "react";

/**
 *  A renderer that can be used instead of a plain ReactNode for the
 *  `element` property of a pane.
 *
 *  The container injects an `openPane` helper that allows the renderer to
 *  push navigation “to the right”:
 *   • If the supplied `id` is new, the pane is appended.
 *   • If the `id` already exists, every pane to its right is discarded
 *     and the matching pane becomes the right-most one.
 */
export type SlipStackPaneRenderer = (args: {
    openPane: (next: SlipStackPaneData) => void;
    closePane: (id: string) => void;
}) => ReactNode;

/**
 *  Metadata required by `SlipStackContainer` to describe a single pane in the horizontal stack.
 *
 *  `element` can be either:
 *   • A plain ReactNode rendered as-is, or
 *   • A `SlipStackPaneRenderer` that receives `openPane` so it can programmatically open further panes.
 */
export interface SlipStackPaneData {
    id: string;
    title: string;
    element: ReactNode | SlipStackPaneRenderer;
}

const basePaneStyle: CSSProperties = {
    backgroundColor: "white",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    flexShrink: "0",
    flexGrow: "0",
    overflowY: "scroll",
    borderLeft: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
};

type Props = PropsWithChildren<{
    width: number;
    style?: CSSProperties;
    /**
     * When provided, indicates that this pane is rendered as a tab.
     * "left" means it is overlapped by panes to the right,
     * "right" means it is partially off screen on the right.
     */
    tabSide?: "left" | "right";
}>;

export const SlipStackPane = forwardRef<HTMLDivElement, Props>(
    ({width, style, tabSide, children}, ref) => (
        <div
            ref={ref}
            data-testid="pane"
            data-tab-side={tabSide ?? ""}
            style={{
                ...basePaneStyle,
                width,
                ...style
            }}
        >
            {children}
        </div>
    ),
);
SlipStackPane.displayName = "SlipStackPane";
