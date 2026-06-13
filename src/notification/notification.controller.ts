import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationModuleConstants } from '../common/constants/messages';
import { NotificationService } from './notification.service';
import { SendEmailDto } from './dto/send.email.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags(NotificationModuleConstants.TAG)
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: NotificationModuleConstants.SUMMARY.SEND_NOTIFICATION,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: NotificationModuleConstants.SUCCESS_MESSAGES.EMAIL_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: NotificationModuleConstants.ERROR_MESSAGES.EMAIL_FAILED,
  })
  @Roles('hr-manger', 'hr-manager')
  @Post('send-notification')
  @ApiProperty()
  sendNotification(@Body() body: SendEmailDto) {
    return this.notificationService.sendEmail(body);
  }
}
