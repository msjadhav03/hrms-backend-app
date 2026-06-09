import { Module } from '@nestjs/common';
import { DatabaseProviders } from './database.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [...DatabaseProviders],
  exports: [...DatabaseProviders],
})
export class DatabasePostgresModule {}
