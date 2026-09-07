import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests serially
  workers: 1,           // Single worker execution
  timeout: 30000,
  use: {
    baseURL: 'https://revitin.com', // Adjust if you have a local dev URL
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'], // Desktop resolution (1280x720) and Chromium user-agent
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }, // Full desktop viewport to prevent layout folding
      },
    },
  ],
});