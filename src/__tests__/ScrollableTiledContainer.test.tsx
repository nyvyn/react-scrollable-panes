import "../../tests/helpers/mockUseMeasure"; // activates the hook mock
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { vi } from "vitest";
import { ScrollableTiledContainer } from "../ScrollableTiledContainer";
import { ScrollableTiledPaneData } from "../ScrollableTiledPane";

// Mock the pane component so we can inspect width via inline style
vi.mock("../ScrollableTiledPane", () => ({
    ScrollableTiledPane: ({width, children}: { width: number; children: ReactNode }) => (
        <div data-testid="pane" style={{width}}>{children}</div>
    )
}));

const makePane = (
    id: string,
    label: string,
    onOpen?: (open: (next: ScrollableTiledPaneData) => void) => void
): ScrollableTiledPaneData => ({
    id,
    element: ({openPane}) => (
        <button data-testid={`btn-${id}`} onClick={() => onOpen?.(openPane)}>
            {label}
        </button>
    )
});

describe("ScrollableTiledContainer", () => {
    it("renders the initial panes", () => {
        render(<ScrollableTiledContainer initial={[makePane("a", "A"), makePane("b", "B")]}/>);
        expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("openPane appends or trims panes", async () => {
        const user = userEvent.setup();
        const panes = [
            makePane("a", "A", (open) => open({id: "c", element: <span>C</span>}))
        ];
        render(<ScrollableTiledContainer initial={panes}/>);
        await user.click(screen.getByTestId("btn-a"));
        expect(screen.getByText("C")).toBeInTheDocument();
    });

    it("splits width evenly when container is wide enough", () => {
        render(<ScrollableTiledContainer initial={[makePane("a", "A"), makePane("b", "B")]}/>);
        const paneWidths = screen.getAllByTestId("pane").map((n) => parseInt((n as HTMLElement).style.width, 10));
        // 800 mocked width / 2 panes = 400
        expect(paneWidths.every((w) => w === 400)).toBe(true);
    });
});
