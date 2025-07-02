# SlipStack
Beautiful, sliding, stacking panes for React.

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

```tsx
// Imperative navigation -----------------
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

Calling `openPane(next)` appends *next* to the right of the calling pane and removes any panes that were further right.

## Behaviour

• All panes share available width equally.  
• If equal division would give any pane `< width`, panes keep `width` and the container becomes horizontally scrollable.  
• `openPane` automatically scrolls the new pane into view, passing the new `SlipStackPaneData` to any 
`SlipStackPaneRenderer`.

## Contributing
PRs and issues are welcome. Run the dev setup with:

```bash
npm install
npm test
```

## Acknowledgements

This project’s horizontally tiled-pane interaction model is inspired by Andy Matuschak’s notes system.

## License
MIT
