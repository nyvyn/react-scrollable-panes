# react-scrollable-tiles
Scrollable horizontally-tiled panes for React.

## Installation
```bash
npm i react-scrollable-tiles
```

## Quick-start
```tsx
import { ScrollableTiledContainer, PaneData } from 'react-scrollable-tiles';
import 'react-scrollable-tiles/styles.css';

const initial: PaneData[] = [
  {
    id: 'home',
    element: ({ openPane }) => (
      <button onClick={() => openPane({
        id: 'details',
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
| `minWidth?` | `number`    | `380`   | Minimum pixel width a pane may occupy before horizontal scrolling is enabled. |

### `PaneData`
```ts
interface PaneData {
  id: string;
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
• If equal division would give any pane `< minWidth`, panes keep `minWidth` and the container becomes horizontally scrollable.  
• `openPane` automatically scrolls the new pane into view.

## Styling
The package ships with minimal CSS (`styles.css`) that defines:

* `.rst-Viewport` – scrollable x-axis wrapper  
* `.rst-Track`    – flex row holding panes  
* `.rst-Pane`     – individual pane (white background, rounded corners, shadow)

Override these classes or wrap the component in your own layout as needed.

## Contributing
PRs and issues are welcome. Run the dev setup with:

```bash
pnpm install
pnpm test
```

## License
MIT
