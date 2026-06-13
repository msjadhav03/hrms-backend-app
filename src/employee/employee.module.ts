import { Module } from '@nestjs/common';
import { DatabaseProviders } from '../database/database.service';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { NotificationService } from '../notification/notification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmployeeController],
  providers: [...DatabaseProviders, EmployeeService, NotificationService],
})
export class EmployeeModule {}
