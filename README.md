# react-scrollable-panes
Beautiful, scrollable horizontally tiled panes for React.

## Installation
```bash
npm i react-scrollable-panes
```

## Quick-start
```tsx
import { ScrollableTiledContainer, ScrollableTiledPaneData } from 'react-scrollable-panes';

const initial: ScrollableTiledPaneData[] = [
  {
    id: 'home',
    title: 'Home',
    element: ({ openPane }) => (
      <button onClick={() => openPane({
        id: 'details',
        title: 'Details',
        element: <div>Details pane</div>
      })}>
        Open details
      </button>
    )
  }
];

function App() {
  return <ScrollableTiledContainer initial={initial} />;
}
```

## Example app
Run the demo application from the `example` folder:

```bash
cd example
pnpm install
pnpm dev
```

## API
### `ScrollableTiledContainer`

| Prop        | Type                          | Default | Description                                                     |
|-------------|-------------------------------|---------|-----------------------------------------------------------------|
| `initial`   | `ScrollableTiledPaneData[]`   | –       | Panes shown when the component mounts.                          |
| `width?`    | `number`                      | `380`   | Minimum pixel width a pane may occupy before horizontal scrolling is enabled. |

### `ScrollableTiledPaneData`
```ts
interface ScrollableTiledPaneData {
  id: string;
  title: string;
  element: ReactNode | ScrollableTiledPaneRenderer;
}
```

### `ScrollableTiledPaneRenderer`
```ts
type ScrollableTiledPaneRenderer = (args: {
  openPane: (next: ScrollableTiledPaneData) => void;
}) => ReactNode;
```

Calling `openPane(next)` appends *next* to the right of the calling pane and removes any panes that were further right.

## Behaviour

• All panes share available width equally.  
• If equal division would give any pane `< width`, panes keep `width` and the container becomes horizontally scrollable.  
• `openPane` automatically scrolls the new pane into view, passing the new `ScrollableTiledPaneData` to any `ScrollableTiledPaneRenderer`.

## Contributing
PRs and issues are welcome. Run the dev setup with:

```bash
pnpm install
pnpm test
```

## Acknowledgements

This project’s horizontally tiled-pane interaction model is inspired by Andy Matuschak’s notes system.

## License
MIT
