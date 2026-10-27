import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library does not auto-clean on its own outside of Jest.
afterEach(() => {
  cleanup();
});
