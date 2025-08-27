import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { seedInitialData } from './seeds/initial-data.seed';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  async onModuleInit() {
    this.logger.log('Database seeder service initializing...');
    // Seed initial data when the module initializes
    await this.seed();
  }

  async seed() {
    this.logger.log('Starting database seeding process...');
    try {
      await seedInitialData();
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Failed to seed database', {
        error: error.message,
        stack: error.stack,
      });
    }
  }
}
