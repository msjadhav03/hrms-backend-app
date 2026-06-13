import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  DashboardModuleConstants,
  ErrorMessages,
} from '../common/constants/messages';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { FilterOptionDto } from './dto/filter.dto';
import { DashboardService } from './dashboard.service';

@ApiTags(DashboardModuleConstants.TAG)
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  /**
   * @param filter - Object Containing country and/or department values
   * @returns - Object containing success response with MIN, MAX and Avg values
   */
  @ApiOperation({
    summary: DashboardModuleConstants.SUMMARY.SUMMARY_DASHBOARD_VARIATION_TREND,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      DashboardModuleConstants.SUCCESS_MESSAGES.SUCCESS_DASHBOARD_MIN_MAX_AVG,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get('/salary-trend')
  async findSalaryAvgMinMax(@Query() filter: FilterOptionDto) {
    return this.dashboardService.getSalaryTrend(filter);
  }
}
