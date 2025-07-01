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

export default function App() {
  return <ScrollableTiledContainer initial={initial} width={380} />;
}
