import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployeeModule } from '../common/constants/messages';

@ApiTags(EmployeeModule.TAG)
@Controller('employee')
export class EmployeeController {}
