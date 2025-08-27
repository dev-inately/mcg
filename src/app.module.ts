import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { AppLoggingModule } from './logging/logging.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { PlansModule } from './modules/plans/plans.module';
import { PendingPoliciesModule } from './modules/pending-policies/pending-policies.module';
import { PoliciesModule } from './modules/policies/policies.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggingModule,
    DatabaseModule,
    ProductsModule,
    PlansModule,
    PendingPoliciesModule,
    PoliciesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
