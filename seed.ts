#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import { SeedCommand } from './src/command/seed.command';

async function bootstrap() {
  await CommandFactory.run(SeedCommand, ['warn', 'log', 'error']);
}

bootstrap();
