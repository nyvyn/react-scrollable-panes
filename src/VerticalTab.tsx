import { CSSProperties } from "react";

const tabStyle: CSSProperties = {
  backgroundColor: "white",
  writingMode: "vertical-lr",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRight: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "inset 0 0 15px 3px rgba(0,0,0,0.05)",
};

interface Props {
  title: string;
  width: number;
}

export function VerticalTab({ title, width }: Props) {
  return (
    <div data-testid="tab" style={{...tabStyle, width}}>{title}</div>
  );
}
