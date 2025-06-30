import { vi } from 'vitest';

// Always return a fixed 800×600 rectangle so pane width math is deterministic
vi.mock('react-use-measure', () => ({
  default: () => [() => {}, { width: 800, height: 600 }] as const
}));
