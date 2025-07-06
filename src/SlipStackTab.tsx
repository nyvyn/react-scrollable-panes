import { CSSProperties, forwardRef } from "react";

const baseTabStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 0 15px 3px rgba(0,0,0,0.05)",
};

const leftTabStyle: CSSProperties = {
    writingMode: "vertical-lr",
    borderRight: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset -6px 0 15px -3px rgba(0,0,0,0.05)",
};

const rightTabStyle: CSSProperties = {
    writingMode: "vertical-rl",
    borderLeft: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "-6px 0 15px -3px rgba(0,0,0,0.05)",
};

type TabProps = {
    title: string;
    width: number;
    side?: "left" | "right";
    style?: CSSProperties;
};

export const SlipStackTab = forwardRef<HTMLDivElement, TabProps>(
    ({title, width, side, style}, ref) => (
        <div
            ref={ref}
            data-testid="tab"
            style={{
                ...baseTabStyle,
                ...(side === "left" ? leftTabStyle : rightTabStyle),
                width,
                ...style
            }}
        >
            {title}
        </div>
    ));
SlipStackTab.displayName = "SlipStackTab";
