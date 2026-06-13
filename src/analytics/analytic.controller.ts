import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticModuleConstants } from '../common/constants/messages';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags(AnalyticModuleConstants.TAG)
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('analytic')
export class AnalyticController {}
