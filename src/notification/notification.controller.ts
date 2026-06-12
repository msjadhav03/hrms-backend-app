import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationModuleConstants } from '../common/constants/messages';

@ApiTags(NotificationModuleConstants.TAG)
@Controller('notification')
export class NotificationController {}
