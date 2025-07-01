import { useState, CSSProperties } from "react";
import { ScrollableTiledContainer, ScrollableTiledPaneData } from 'react-scrollable-panes';

const notes = [
  { id: "note-1",  title: "Shopping list",  body: "Milk, Eggs, Bread…" },
  { id: "note-2",  title: "Ideas",          body: "Build a rocket…"    },
  { id: "note-3",  title: "Todos",          body: "Walk the dog…"      },
  { id: "note-4",  title: "Meeting",        body: "Discuss timeline…"  },
  { id: "note-5",  title: "Books",          body: "1984, Dune…"        },
  { id: "note-6",  title: "Movies",         body: "Inception, Matrix"  },
  { id: "note-7",  title: "Recipe",         body: "Pasta al pesto…"    },
  { id: "note-8",  title: "Passwords",      body: "Use a manager"      },
  { id: "note-9",  title: "Bucket list",    body: "Sky-diving"         },
  { id: "note-10", title: "Quotes",         body: "Carpe diem"         },
] as const;

export default function App() {
  const [open, setOpen] = useState<ScrollableTiledPaneData[]>([]);

  const addNote = (n: typeof notes[number]) =>
    setOpen(p =>
      p.find(x => x.id === n.id)
        ? p
        : [...p, { id: n.id, title: n.title, element: <div style={noteStyle}>{n.body}</div> }],
    );

  const layout: CSSProperties = { display: "flex", height: "100vh" };
  const listStyle: CSSProperties = {
    width: 220,
    margin: 0,
    padding: 0,
    borderRight: "1px solid #ccc",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };
  const rowButton: CSSProperties = {
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "1px solid #ccc",
    outline: "none",
    background: "transparent",
    cursor: "pointer",
  };
  const noteStyle: CSSProperties = { padding: "16px" };   // NEW

  return (
    <div style={layout}>
      <ul style={listStyle}>
        {notes.map(n => (
          <li key={n.id} style={{ margin: 0 }}>
            <button style={rowButton} onClick={() => addNote(n)}>
              {n.title}
            </button>
          </li>
        ))}
      </ul>

      {/* the panes that are currently open */}
      <ScrollableTiledContainer initial={open} width={500} />
    </div>
  );
}
