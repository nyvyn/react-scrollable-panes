import "@testing-library/jest-dom";

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

(globalThis as any).ResizeObserver = ResizeObserver;

// Mock scrollTo as it is not implemented in JSDOM
if (typeof window !== 'undefined' && window.HTMLElement.prototype.scrollTo === undefined) {
    window.HTMLElement.prototype.scrollTo = () => {};
}
