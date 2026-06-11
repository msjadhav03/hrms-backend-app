import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseProviders } from '../database/database.service';

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [...DatabaseProviders, DashboardService],
})
export class DashboardModule {}
