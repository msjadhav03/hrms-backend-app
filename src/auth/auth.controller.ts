import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthModuleConstants } from '../common/constants/messages';

@ApiTags(AuthModuleConstants.TAG)
@Controller()
export class AuthController {}
