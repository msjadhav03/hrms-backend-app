import { Module } from '@nestjs/common';
import { SeedingController } from './seeding.controller';
import { SeedingService } from './seeding.service';
import { DatabaseProviders } from '../database/database.service';

@Module({
  imports: [],
  controllers: [SeedingController],
  providers: [...DatabaseProviders, SeedingService],
})
export class SeeedingModule {}
