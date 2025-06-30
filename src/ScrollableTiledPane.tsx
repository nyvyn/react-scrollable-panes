import { forwardRef, PropsWithChildren, ReactNode } from "react";

export type PaneRenderer = (args: { openPane: (next: PaneData) => void }) => ReactNode;

export interface PaneData {
    id: string;
    element: ReactNode | PaneRenderer;
}

type Props = PropsWithChildren<{
    width: number
}>

export const ScrollableTiledPane = forwardRef<HTMLDivElement, Props>(
    ({width, children}, ref) => (
        <div
            ref={ref}
            className="rst-Pane"
            style={{width, flex: `0 0 ${width}px`}}
        >
            {children}
        </div>
    ),
);
ScrollableTiledPane.displayName = "ScrollableTiledPane";
