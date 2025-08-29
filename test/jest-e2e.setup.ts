import { config } from 'dotenv';

// Mock the CommandModule globally
jest.mock('../src/command/command.module', () => ({
  CommandModule: class MockCommandModule {},
}));

config({ path: '.env.test' });
process.env.NODE_ENV = 'test';
jest.setTimeout(30000);
