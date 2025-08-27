import { Injectable, OnModuleInit } from '@nestjs/common';
import { seedInitialData } from './seeds/initial-data.seed';

@Injectable()
export class SeederService implements OnModuleInit {
  async onModuleInit() {
    // Seed initial data when the module initializes
    await this.seed();
  }

  async seed() {
    try {
      await seedInitialData();
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  }
}
