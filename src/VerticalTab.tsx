import { CSSProperties } from "react";

const baseStyle: CSSProperties = {
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 0 15px 3px rgba(0,0,0,0.05)",
    scrollSnapAlign: "start",
};

const leftStyle: CSSProperties = {
    writingMode: "vertical-lr",
    borderRight: "1px solid rgba(0,0,0,0.05)",
    justifySelf: "flex-start",
    boxShadow: "inset -6px 0 15px -3px rgba(0,0,0,0.05)",
};

const rightStyle: CSSProperties = {
    writingMode: "vertical-rl",
    borderLeft: "1px solid rgba(0,0,0,0.05)",
    justifySelf: "flex-end",
    boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
}

interface Props {
    title: string;
    width: number;
    side?: "left" | "right";
}

export function VerticalTab({title, width, side = "left"}: Props) {
    const style: CSSProperties = {
        ...baseStyle,
        ...(side === "left" ? leftStyle : rightStyle),
        width,
    };
    return (
        <div data-testid="tab" style={style}>{title}</div>
    );
}
