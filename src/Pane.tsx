import { forwardRef, PropsWithChildren, ReactNode } from "react";

export interface PaneData {
    id: string
    element: ReactNode
}

type Props = PropsWithChildren<{
    width: number
}>

export const Pane = forwardRef<HTMLDivElement, Props>(
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
Pane.displayName = "Pane";