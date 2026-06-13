import { Module } from '@nestjs/common';
import { AnalyticController } from './analytic.controller';
import { AnalyticService } from './analytic.service';
import { DatabaseProviders } from '../database/database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnalyticController],
  providers: [...DatabaseProviders, AnalyticService],
})
export class AnalyticModule {}
