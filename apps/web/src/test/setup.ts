import { beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Global setup to clear storage before each test
// This helps prevent Zustand persist from interfering with tests
beforeEach(() => {
  // Clear all storage before each test
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // Clean up after each test
  localStorage.clear();
  sessionStorage.clear();
});
