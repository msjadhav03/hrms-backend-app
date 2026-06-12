import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EmployeeModuleConstants,
  ErrorMessages,
} from '../common/constants/messages';
import { CreateEmployeeDto } from './dto/create.employee.dto';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDto } from './dto/update.employee.dto';
import { GetEmployeeDto } from './dto/get.employee.dto';

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

  /**
   * @param id -  Employee ID to update employee data
   * @param updateEmployeeDto - Object containing data to be updated
   * @returns - Object Containing success response
   */
  @ApiOperation({ summary: EmployeeModuleConstants.SUMMARY.EMPLOYEE_UPDATE })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_UPDATE_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  /**
   * @param getEmployeeDto - Object to filter basis on country and/or department
   * @returns Objest containing success response
   */
  @ApiOperation({ summary: EmployeeModuleConstants.SUMMARY.EMPLOYEE_FETCH })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get()
  async getEmployees(@Query() getEmployeeDto: GetEmployeeDto) {
    return this.employeeService.find(getEmployeeDto);
  }
  /**
   *
   * @param id - Employee ID to fetch employee data
   * @returns - Object containing specific emplpyee data
   */
  @ApiOperation({
    summary: EmployeeModuleConstants.SUMMARY.EMPLOYEE_FETCH_BY_ID,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.findEmployeeById(id);
  }

  /**
   *
   * @param id - Employee ID to fetch employee data
   * @returns - Object containing specific emplpyee data
   */
  @ApiOperation({
    summary: EmployeeModuleConstants.SUMMARY.EMPLOYEE_DELETED,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_DELETE_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.employeeService.deleteOne(id);
  }
}
