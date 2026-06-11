import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticModuleConstants } from '../common/constants/messages';

@ApiTags(AnalyticModuleConstants.TAG)
@Controller('analytic')
export class AnalyticController {}
