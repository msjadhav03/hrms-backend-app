import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardModuleConstants } from '../common/constants/messages';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags(DashboardModuleConstants.TAG)
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {}
