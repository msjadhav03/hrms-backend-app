import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardModuleConstants } from '../common/constants/messages';

@ApiTags(DashboardModuleConstants.TAG)
@Controller('dashboard')
export class DashboardController {}
