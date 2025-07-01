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
export type ScrollableTiledPaneRenderer = (args: { openPane: (next: ScrollableTiledPaneData) => void }) => ReactNode;

/**
 *  Metadata required by `ScrollableTiledContainer` to describe a single
 *  pane in the horizontal stack.
 *
 *  `element` can be either:
 *   • A plain ReactNode rendered as-is, or
 *   • A `ScrollableTiledPaneRenderer` that receives `openPane` so it can
 *     programmatically open further panes.
 */
export interface ScrollableTiledPaneData {
    id: string;
    title: string;
    element: ReactNode | ScrollableTiledPaneRenderer;
}

const basePaneStyle: CSSProperties = {
    backgroundColor: "white",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    flexShrink: "0",
    flexGrow: "0",
    overflowY: "scroll",
    borderRight: "1px solid rgba(0,0,0,0.1)",
    scrollSnapAlign: "start",
};

type Props = PropsWithChildren<{
    width: number;
    style?: CSSProperties;
}>;

export const ScrollableTiledPane = forwardRef<HTMLDivElement, Props>(
    ({ width, style, children }, ref) => (
        <div
            ref={ref}
            data-testid="pane"
            style={{ ...basePaneStyle, width, ...style }}
        >
            {children}
        </div>
    ),
);
ScrollableTiledPane.displayName = "ScrollableTiledPane";
