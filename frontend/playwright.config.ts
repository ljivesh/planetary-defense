import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run the real stack offline:
//   browser → Vite (:5183) → Go API (:8091) → fake JPL (:9091, recorded fixtures)
// Ports differ from `make dev` so the suite can run while the dev servers are up.
const CI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5183',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      name: 'fake-jpl',
      command: 'go run ./cmd/fakejpl -addr :9091',
      cwd: '../backend',
      url: 'http://localhost:9091/cad.api',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      name: 'api',
      command: 'go run ./cmd/server',
      cwd: '../backend',
      env: { ADDR: ':8091', JPL_BASE_URL: 'http://localhost:9091', LOG_LEVEL: 'warn' },
      url: 'http://localhost:8091/api/v1/health',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      name: 'web',
      command: 'pnpm exec vite --port 5183 --strictPort',
      env: { API_URL: 'http://localhost:8091' },
      url: 'http://localhost:5183',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
})
