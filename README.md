# react-scrollable-panes
Scrollable horizontally-tiled panes for React.

## Installation
```bash
npm i react-scrollable-panes
```

## Quick-start
```tsx
import { ScrollableTiledContainer, PaneData } from 'react-scrollable-panes';

const initial: PaneData[] = [
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

## API
### `ScrollableTiledContainer`

| Prop        | Type        | Default | Description                                                     |
|-------------|-------------|---------|-----------------------------------------------------------------|
| `initial`   | `PaneData[]`| –       | Panes shown when the component mounts.                          |
| `width?`    | `number`    | `380`   | Minimum pixel width a pane may occupy before horizontal scrolling is enabled. |

### `PaneData`

```ts
interface PaneData {
  id: string;
  title: string;
  element: ReactNode | PaneRenderer;
}
```

### `PaneRenderer`
```ts
type PaneRenderer = (args: { openPane: (next: PaneData) => void }) => ReactNode;
```

Calling `openPane(next)` appends *next* to the right of the calling pane and removes any panes that were further right.

## Behaviour

• All panes share available width equally.  
• If equal division would give any pane `< width`, panes keep `width` and the container becomes horizontally scrollable.  
• `openPane` automatically scrolls the new pane into view.

## Contributing
PRs and issues are welcome. Run the dev setup with:

```bash
pnpm install
pnpm test
```

## Acknowledgements

This project’s tiled-pane interaction model is inspired by Andy Matuschak’s notes system.

## License
MIT
