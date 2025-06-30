import { CSSProperties } from "react";

const tabStyle: CSSProperties = {
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  flexShrink: 0,
  borderRight: "1px solid rgba(0,0,0,0.1)",
};

interface Props {
  title: string;
}

export function VerticalTab({ title }: Props) {
  return (
    <div data-testid="tab" style={tabStyle}>{title}</div>
  );
}
