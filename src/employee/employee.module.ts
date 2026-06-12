import { Module } from '@nestjs/common';
import { DatabaseProviders } from '../database/database.service';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [...DatabaseProviders, EmployeeService, NotificationService],
})
export class EmployeeModule {}
