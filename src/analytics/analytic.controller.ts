import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AnalyticModuleConstants,
  ErrorMessages,
} from '../common/constants/messages';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AnalyticService } from './analytic.service';
import { GetAnalyticDto } from './dto/get.analytic.dto';

@ApiTags(AnalyticModuleConstants.TAG)
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('analytic')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}
  @ApiOperation({
    summary: AnalyticModuleConstants.SUMMARY.SUMMARY_ENTITY_COUNT,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_ENTITY_COUNT,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get('/count-of-entities')
  async findEntityCount(@Query() filter: GetAnalyticDto) {
    return this.analyticService.findCountOfEntities(filter);
  }

  @ApiOperation({
    summary: AnalyticModuleConstants.SUMMARY.SUMMARY_TOP_MOST_PAID_DEPARTMENT,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_TOP_MOST_PAID_JOBS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get('/top-most-paid-jobs')
  async findTopMostPaidJobs(@Query() filter: GetAnalyticDto) {
    return this.analyticService.findTopMostPaidJobs(filter);
  }

  @ApiOperation({
    summary: AnalyticModuleConstants.SUMMARY.SUMMARY_TOP_MOST_PAID_DEPARTMENT,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_TOP_MOST_PAID_DEPARTMENT,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: ErrorMessages.FORBIDDEN_ERROR,
  })
  @Get('/top-most-paid-department')
  async findTopMostPaidDepartment(@Query() filter: GetAnalyticDto) {
    return this.analyticService.findTopMostPaidDepartment(filter);
  }
}
