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
    padding: "2rem",
    flexDirection: "column",
    flexShrink: "0",
    flexGrow: "0",
    overflowY: "scroll",
};

type Props = PropsWithChildren<{
    id: string;
    style?: CSSProperties;
    width: number;
}>;

/**
 * SlipStackPane is a React functional component built with `forwardRef` that renders a customizable `<div>` element.
 */
export const SlipStackPane = forwardRef<HTMLDivElement, Props>(
    ({id, style, width, children}, ref) => (
        <div
            ref={ref}
            id={id}
            className="slipstack-pane"
            data-testid="slipstack-pane"
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
