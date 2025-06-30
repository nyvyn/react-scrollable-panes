import '@testing-library/jest-dom';

// very-light ResizeObserver polyfill – needed by react-use-measure in JSDOM
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = RO;
