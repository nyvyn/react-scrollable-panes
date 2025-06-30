import { forwardRef, PropsWithChildren, ReactNode, CSSProperties } from "react";

export type PaneRenderer = (args: { openPane: (next: PaneData) => void }) => ReactNode;

export interface PaneData {
    id: string;
    element: ReactNode | PaneRenderer;
}

const basePaneStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

type Props = PropsWithChildren<{
    width: number
}>

export const ScrollableTiledPane = forwardRef<HTMLDivElement, Props>(
    ({width, children}, ref) => (
        <div
            ref={ref}
            style={{ ...basePaneStyle, width, flex: `0 0 ${width}px` }}
        >
            {children}
        </div>
    ),
);
ScrollableTiledPane.displayName = "ScrollableTiledPane";
