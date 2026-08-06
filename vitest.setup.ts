import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

class ResizeObserverMock implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  disconnect = vi.fn();
  observe = vi.fn((target: Element) => {
    this.callback(
      [
        {
          target,
          contentRect: {
            width: 800,
            height: 400,
            x: 0,
            y: 0,
            top: 0,
            right: 800,
            bottom: 400,
            left: 0,
            toJSON: () => ({}),
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  });
  unobserve = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
});
