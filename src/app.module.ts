import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-expection.filter';
import { DatabasePostgresModule } from './database/database.module';
import { SeeedingModule } from './seeding/seeding.module';
import { NotificationModule } from './notification/notification.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabasePostgresModule,
    SeeedingModule,
    NotificationModule,
    EmployeeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
