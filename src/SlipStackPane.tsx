import { CSSProperties, forwardRef, PropsWithChildren, ReactNode, useEffect, useState } from "react";

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

const tabWidth = 40;

type Props = PropsWithChildren<{
    width: number;
    title: string;
    style?: CSSProperties;
    /** When true, indicates this pane overlaps another */
    isOverlapping?: boolean;
}>;

export const SlipStackPane = forwardRef<HTMLDivElement, Props>(
    ({width, title, style, isOverlapping, children}, ref) => {
        const divRef = ref as React.RefObject<HTMLDivElement>;

        const [collapsed, setCollapsed] = useState(false);
        const [side, setSide] = useState<"left" | "right" | null>(null);

        useEffect(() => {
            if (!divRef.current) return;
            const node = divRef.current;
            const update = () => {
                setCollapsed(node.dataset.collapsed === "true");
                setSide((node.dataset.side as "left" | "right") ?? null);
            };
            update();
            const mo = new MutationObserver(update);
            mo.observe(node, {attributes: true});
            return () => mo.disconnect();
        }, [divRef]);
        const paneStyle: CSSProperties = {
            ...basePaneStyle,
            width: collapsed ? tabWidth : width,
            ...(isOverlapping ? { border: "2px solid red" } : {}),
            ...style,
            display: collapsed ? "flex" : "flex",
            alignItems: collapsed ? "center" : undefined,
            justifyContent: collapsed ? "center" : undefined,
        };

        const titleStyle: CSSProperties = {
            padding: 8,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            fontWeight: "bold",
        };

        const rotated: CSSProperties = collapsed ? {
            writingMode: side === "right" ? "vertical-lr" : "vertical-rl",
        } : {};

        return (
            <div ref={ref} data-testid="pane" style={paneStyle}>
                <div className="slipstack-title" style={{...titleStyle, ...rotated}}>{title}</div>
                {!collapsed && (
                    <div className="slipstack-content" style={{flex: 1}}>{children}</div>
                )}
            </div>
        );
    },
);
SlipStackPane.displayName = "SlipStackPane";
