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
    id: string;
    style?: CSSProperties;
    width: number;
    title: string;
}>;

/**
 * SlipStackPane is a React functional component built with `forwardRef` that renders a customizable `<div>` element.
 * This component accepts a combination of props and styles, allowing it to be used flexibly within an application.
 *
 * @param {object} props - The properties object.
 * @param {string} [props.id] - The unique identifier for the `<div>` element.
 * @param {React.CSSProperties} [props.style] - Additional CSS styles to apply to the base style of the component.
 * @param {React.ReactNode} [props.children] - The child elements or components to be rendered inside the `<div>`.
 * @param {string | number} [props.width] - The width of the component, applied as part of its style.
 * @param {React.Ref<HTMLDivElement>} ref - A forwarded `ref` to access the underlying DOM element, if needed.
 *
 * @returns {JSX.Element} A `<div>` element with customizable styles and behavior.
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
