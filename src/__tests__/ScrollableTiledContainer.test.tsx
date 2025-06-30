import '../../tests/helpers/mockUseMeasure';      // ← registers the react-use-measure mock
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollableTiledContainer } from '../ScrollableTiledContainer';

const makeOpenerPane = (id: string, nextId: string, nextElement: React.ReactNode) => ({
  id,
  element: ({ openPane }: { openPane: any }) => (
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

  render(<ScrollableTiledContainer initial={initial} minWidth={minWidth} />);

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
