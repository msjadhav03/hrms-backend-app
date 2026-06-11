import { Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedingService } from './seeding.service';
import { SeedingModule, ErrorMessages } from 'src/common/constants/messages';

@ApiTags(SeedingModule.TAG)
@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @ApiOperation({ summary: SeedingModule.SUMMARY.TABLE_CREATION })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SeedingModule.SUCCESS_MESSAGES.TABLE_CREATION_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @Post('create')
  createDatabase() {
    return this.seedingService.createDatabase();
  }

  @ApiOperation({ summary: SeedingModule.SUMMARY.TABLE_DROP })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SeedingModule.SUCCESS_MESSAGES.TABLE_DROP_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessages.INTERNAL_SERVER_ERROR,
  })
  @Post('drop')
  dropDatabase() {
    return this.seedingService.dropDatabase();
  }
}
