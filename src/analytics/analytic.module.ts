import { Module } from '@nestjs/common';
import { AnalyticController } from './analytic.controller';
import { AnalyticService } from './analytic.service';
import { DatabaseProviders } from '../database/database.service';

@Module({
  imports: [],
  controllers: [AnalyticController],
  providers: [...DatabaseProviders, AnalyticService],
})
export class AnalyticModule {}
