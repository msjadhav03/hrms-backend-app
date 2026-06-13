import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthModuleConstants } from '../common/constants/messages';
import { AuthService } from './auth.service';
import { Public as PublicRoute } from './public.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags(AuthModuleConstants.TAG)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: AuthModuleConstants.SUMMARY.LOGIN_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthModuleConstants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: AuthModuleConstants.ERROR_MESSAGES.FORBIDDEN,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: AuthModuleConstants.ERROR_MESSAGES.LOGIN_FAILED,
  })
  @PublicRoute()
  @Post('/login')
  async login(@Body() body: LoginDto) {
    console.log(body);
    return this.authService.validateCredentials(body.username, body.password);
  }
}
