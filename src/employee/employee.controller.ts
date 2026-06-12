import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeeModuleConstants } from '../common/constants/messages';
import { CreateEmployeeDto } from './dto/create.employee.dto';
import { EmployeeService } from './employee.service';

@ApiTags(EmployeeModuleConstants.TAG)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: EmployeeModuleConstants.SUMMARY.EMPLOYEE_CREATION })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_CREATION_FAILED,
  })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeeService.createNewEmployee(createEmployeeDto);
  }
}
