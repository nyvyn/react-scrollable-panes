import "../../tests/helpers/mockUseMeasure"; // ← registers the react-use-measure mock
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { SlipStackContainer } from "@/SlipStackContainer";

import type { SlipStackPaneData } from "@/SlipStackPane";

type OpenPane = (next: SlipStackPaneData) => void;

const makeOpenerPane = (id: string, nextId: string, nextElement: ReactNode) => ({
    id,
    title: id,
    element: ({openPane}: { openPane: OpenPane }) => (
        <button onClick={() => openPane({id: nextId, title: nextId, element: nextElement})}>
            {`open ${nextId}`}
        </button>
    ),
});

it("appends a new pane and recalculates pane widths", async () => {
    const user = userEvent.setup();
    const width = 400;

    // 1️⃣  one opener pane that can add pane “B”
    const initial = [
        makeOpenerPane("A", "B", <span>B-content</span>),
    ];

    render(<SlipStackContainer paneData={initial} paneWidth={width}/>);

    // → initially exactly one .pane with full width (= 800 px from mock)
    let panes = screen.getAllByTestId("pane");
    expect(panes).toHaveLength(1);
    expect(panes[0]).toHaveStyle({width: "400px"});

    // 2️⃣  click button inside first pane to open B
    await user.click(screen.getByRole("button", {name: /open B/i}));

    // → now two panes, both 400 px wide (800 px / 2)
    panes = screen.getAllByTestId("pane");
    expect(panes).toHaveLength(2);
    panes.forEach(p => expect(p).toHaveStyle({width: "400px"}));

    // and the new pane’s content is rendered
    expect(screen.getByText("B-content")).toBeInTheDocument();
});

it("slides panes over the first when width is limited", async () => {
    const user = userEvent.setup();
    const minWidth = 300;

    const paneC = {id: "C", title: "C", element: <span>C-content</span>};
    const paneB = makeOpenerPane("B", "C", <span>C-content</span>);
    paneB.element = ({openPane}: { openPane: OpenPane }) => (
        <button onClick={() => openPane(paneC)}>open C</button>
    );

    const initial = [
        {
            id: "A",
            title: "A",
            element: ({openPane}: { openPane: OpenPane }) => (
                <button onClick={() => openPane(paneB)}>open B</button>
            ),
        },
    ];

    render(<SlipStackContainer initial={initial} width={minWidth}/>);

    await user.click(screen.getByRole("button", {name: /open B/i}));
    await user.click(screen.getByRole("button", {name: /open C/i}));

    const panes = screen.getAllByTestId("pane");
    expect(panes).toHaveLength(3);
    panes.forEach((p) => expect(p).toHaveStyle({width: "300px"}));
    expect(panes[0]).toHaveStyle({position: "absolute"});
});

it("creates vertical tabs when panes exceed available width", async () => {
    const user = userEvent.setup();
    const width = 300;

    const paneD = {id: "D", title: "D", element: <span>D-content</span>};
    const paneC = makeOpenerPane("C", "D", <span>D-content</span>);
    paneC.element = ({openPane}: { openPane: OpenPane }) => (
        <button onClick={() => openPane(paneD)}>open D</button>
    );
    const paneB = makeOpenerPane("B", "C", <span>C-content</span>);
    paneB.element = ({openPane}: { openPane: OpenPane }) => (
        <button onClick={() => openPane(paneC)}>open C</button>
    );

    const initial = [
        {
            id: "A",
            title: "A",
            element: ({openPane}: { openPane: OpenPane }) => (
                <button onClick={() => openPane(paneB)}>open B</button>
            ),
        },
    ];

    render(<SlipStackContainer initial={initial} width={width}/>);

    await user.click(screen.getByRole("button", {name: /open B/i}));
    await user.click(screen.getByRole("button", {name: /open C/i}));
    await user.click(screen.getByRole("button", {name: /open D/i}));

    expect(screen.getAllByTestId("pane")).toHaveLength(3);
    expect(screen.getAllByTestId("tab")).toHaveLength(1);
});
