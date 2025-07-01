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
    return <SlipStackContainer initial={initial} width={500}/>;
}
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
| `initial`   | `SlipStackPaneData[]` | –       | Panes shown when the component mounts. |
| `width?`    | `number`              | `380`   | Maximum width of each pane.            |

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
