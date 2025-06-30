import { CSSProperties, forwardRef, PropsWithChildren, ReactNode } from "react";

export type ScrollableTiledPaneRenderer = (args: { openPane: (next: ScrollableTiledPaneData) => void }) => ReactNode;

export interface ScrollableTiledPaneData {
    id: string;
    element: ReactNode | ScrollableTiledPaneRenderer;
}

const basePaneStyle: CSSProperties = {
    backgroundColor: "white",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)",
};

type Props = PropsWithChildren<{
    width: number
}>

export const ScrollableTiledPane = forwardRef<HTMLDivElement, Props>(
    ({width, children}, ref) => (
        <div
            ref={ref}
            style={{...basePaneStyle, width}}
        >
            {children}
        </div>
    ),
);
ScrollableTiledPane.displayName = "ScrollableTiledPane";
