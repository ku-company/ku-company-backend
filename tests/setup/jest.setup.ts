import { jest } from '@jest/globals';

// Mock dotenv so imports like `import dotenv from 'dotenv'; dotenv.config()` don't crash in ESM
jest.mock('dotenv', () => {
  const config = jest.fn(() => ({}));
  return {
    __esModule: true,
    default: { config },
    config,
  };
});
