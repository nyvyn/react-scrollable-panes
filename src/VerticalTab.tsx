import { CSSProperties } from "react";

const baseStyle: CSSProperties = {
  backgroundColor: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "inset 0 0 15px 3px rgba(0,0,0,0.05)",
};

interface Props {
  title: string;
  width: number;
  side?: 'left' | 'right';
}

export function VerticalTab({ title, width, side = 'left' }: Props) {
  const style: CSSProperties = {
    ...baseStyle,
    width,
    writingMode: side === 'left' ? 'vertical-lr' : 'vertical-rl',
    borderRight: side === 'left' ? '1px solid rgba(0,0,0,0.05)' : undefined,
    borderLeft: side === 'right' ? '1px solid rgba(0,0,0,0.05)' : undefined,
  };
  return (
    <div data-testid="tab" style={style}>{title}</div>
  );
}
