import "../../tests/helpers/mockUseMeasure";
import { render } from "@testing-library/react";
import { act } from "react";
import { createRef } from "react";
import { SlipStackContainer } from "@/SlipStackContainer";
import type { SlipStackHandle } from "@/SlipStackContainer";

test("track position persists when adding pane", async () => {
    const width = 300;
    const ref = createRef<SlipStackHandle>();
    const panes = [
        { id: "A", title: "A", element: <span>A</span> },
        { id: "B", title: "B", element: <span>B</span> },
        { id: "C", title: "C", element: <span>C</span> },
    ];
    render(<SlipStackContainer ref={ref} paneData={panes} paneWidth={width} />);
    const track = document.getElementById("slipstack-track") as HTMLElement;
    const before = parseFloat(getComputedStyle(track).marginLeft);

    act(() => {
        ref.current!.openPane({ id: "D", title: "D", element: <span>D</span> });
    });

    await new Promise(r => setTimeout(r));

    const after = parseFloat(getComputedStyle(track).marginLeft);
    expect(Math.abs(after - before)).toBeLessThan(1);
});
