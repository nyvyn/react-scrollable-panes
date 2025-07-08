# SlipStack
Beautiful, sliding, stacking panes for React.

![SlipStack in action](slipstack-react.gif)

## Installation
```bash
npm i slipstack-react
```

## Quick-start

```tsx
import { SlipStackContainer, SlipStackPaneData } from "slipstack-react";

const initial: SlipStackPaneData[] = [
    {
        id: "home",
        title: "Home",
        element: ({openPane}) => (
            <button onClick={() => openPane({
                id: "details",
                title: "Details",
                element: <div>Details pane</div>
            })}>
                Open details
            </button>
        )
    }
];

function App() {
    return <SlipStackContainer paneData={initial} paneWidth={500} />;
}
```

Alternatively, you can use React imperative to navigate with the container.

```tsx
import { useRef } from "react";
import { SlipStackContainer, SlipStackHandle } from "slipstack-react";

const ref = useRef<SlipStackHandle>(null);

<SlipStackContainer ref={ref} paneData={initial} paneWidth={500} />;

// open another pane programmatically
ref.current?.openPane({
  id: "settings",
  title: "Settings",
  element: <div>Settings pane</div>,
});
```

## Example app
Run the demo application from the `example` folder:

```bash
cd example
npm install
npm dev
```

## API
### `SlipStackContainer`

| Prop        | Type                  | Default | Description                            |
|-------------|-----------------------|---------|----------------------------------------|
| `paneData`  | `SlipStackPaneData[]` | –       | Panes shown when the component mounts. |
| `paneWidth` | `number`              | `380`   | Maximum width of each pane.            |
| `tabWidth`  | `number`              | `40`    | Maximum width of each tab.             |

### `SlipStackPaneData`

```ts
import { SlipStackPaneRenderer } from "./SlipStackPane";

interface SlipStackPaneData {
    id: string;
    title: string;
    element: ReactNode | SlipStackPaneRenderer;
}
```

### `SlipStackPaneRenderer`
```ts
type SlipStackPaneRenderer = (args: {
  openPane: (next: SlipStackPaneData) => void;
}) => ReactNode;
```

### SlipStackHandle
Returned when you attach `ref` to the container.

| Method     | Description                                       |
|------------|---------------------------------------------------|
| `openPane` | `openPane(next: SlipStackPaneData): void` &nbsp;—&nbsp;programmatically open or navigate to *next*. |
| `closePane` | `closePane(id: string): void` &nbsp;—&nbsp;programmatically close a specified pane by its identifier. |

Calling `openPane(next)` appends *next* to the right of the calling pane and removes any panes that were further right.

## Behaviour

• Every pane is rendered with a fixed width  
  `maxWidth = min(paneWidth, viewportWidth)` – they are never shrunk below this value.  
• If the total width of visible panes exceeds the viewport, the container
  converts the left-most panes into 40 px vertical tabs and/or horizontally
  scrolls the sliding track to keep everything accessible.  
• `openPane(next)` appends (or navigates to) *next*, recomputes the layout, and scrolls the new pane into view.  
• `closePane(id)` removes the pane with the specified `id` from the container and recomputes the layout.

## Contributing
PRs and issues are welcome. Run the dev setup with:

```bash
npm install
npm test
```

## Acknowledgements

This project’s horizontally stacking interaction model is inspired by
[Andy Matuschak’s working notes](https://notes.andymatuschak.org).

## License
MIT
