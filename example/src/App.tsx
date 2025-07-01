import { useState, CSSProperties } from "react";
import { ScrollableTiledContainer, ScrollableTiledPaneData } from 'react-scrollable-panes';

const notes = [
  { id: "note-1", title: "Shopping list",  body: "Milk, Eggs, Bread…" },
  { id: "note-2", title: "Ideas",          body: "Build a rocket…"    },
  { id: "note-3", title: "Todos",          body: "Walk the dog…"      },
] as const;

export default function App() {
  const [open, setOpen] = useState<ScrollableTiledPaneData[]>([]);

  const addNote = (n: typeof notes[number]) =>
    setOpen(p =>
      p.find(x => x.id === n.id)
        ? p
        : [...p, { id: n.id, title: n.title, element: <div>{n.body}</div> }],
    );

  const layout: CSSProperties = { display: "flex", height: "100vh" };
  const listStyle: CSSProperties = { width: 200, margin: 0, padding: 0 };

  return (
    <div style={layout}>
      <ul style={listStyle}>
        {notes.map(n => (
          <li key={n.id} style={{ listStyle: "none", marginBottom: 4 }}>
            <button onClick={() => addNote(n)}>{n.title}</button>
          </li>
        ))}
      </ul>

      {/* the panes that are currently open */}
      <ScrollableTiledContainer initial={open} width={380} />
    </div>
  );
}
