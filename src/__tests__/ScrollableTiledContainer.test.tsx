import '../../tests/helpers/mockUseMeasure';      // ← registers the react-use-measure mock
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollableTiledContainer } from '../ScrollableTiledContainer';
import type { ReactNode } from 'react';
import type { ScrollableTiledPaneData } from '../ScrollableTiledPane';

type OpenPane = (next: ScrollableTiledPaneData) => void;

const makeOpenerPane = (id: string, nextId: string, nextElement: ReactNode) => ({
  id,
  element: ({ openPane }: { openPane: OpenPane }) => (
    <button onClick={() => openPane({ id: nextId, element: nextElement })}>
      {`open ${nextId}`}
    </button>
  ),
});

it('appends a new pane and recalculates pane widths', async () => {
  const user = userEvent.setup();
  const minWidth = 200;

  // 1️⃣  one opener pane that can add pane “B”
  const initial = [
    makeOpenerPane('A', 'B', <span>B-content</span>),
  ];

  render(<ScrollableTiledContainer initial={initial} width={minWidth} />);

  // → initially exactly one .pane with full width (= 800 px from mock)
  let panes = screen.getAllByTestId('pane');
  expect(panes).toHaveLength(1);
  expect(panes[0]).toHaveStyle({ width: '800px' });

  // 2️⃣  click button inside first pane to open B
  await user.click(screen.getByRole('button', { name: /open B/i }));

  // → now two panes, both 400 px wide (800 px / 2)
  panes = screen.getAllByTestId('pane');
  expect(panes).toHaveLength(2);
  panes.forEach(p => expect(p).toHaveStyle({ width: '400px' }));

  // and the new pane’s content is rendered
  expect(screen.getByText('B-content')).toBeInTheDocument();
});

it('slides panes over the first when width is limited', async () => {
  const user = userEvent.setup();
  const minWidth = 300;

  const paneC = { id: 'C', element: <span>C-content</span> };
  const paneB = makeOpenerPane('B', 'C', <span>C-content</span>);
  paneB.element = ({ openPane }: { openPane: OpenPane }) => (
    <button onClick={() => openPane(paneC)}>open C</button>
  );

  const initial = [
    {
      id: 'A',
      element: ({ openPane }: { openPane: OpenPane }) => (
        <button onClick={() => openPane(paneB)}>open B</button>
      ),
    },
  ];

  render(<ScrollableTiledContainer initial={initial} width={minWidth} />);

  await user.click(screen.getByRole('button', { name: /open B/i }));
  await user.click(screen.getByRole('button', { name: /open C/i }));

  const panes = screen.getAllByTestId('pane');
  expect(panes).toHaveLength(3);
  panes.forEach((p) => expect(p).toHaveStyle({ width: '300px' }));
  expect(panes[0]).toHaveStyle({ position: 'absolute' });

  const track = screen.getByTestId('track');
  expect(track).toHaveStyle({ transform: 'translateX(-100px)' });
});
