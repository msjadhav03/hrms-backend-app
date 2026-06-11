import { Module } from '@nestjs/common';
import { DatabaseProviders } from '../database/database.service';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [...DatabaseProviders, EmployeeService],
})
export class EmployeeModule {}
