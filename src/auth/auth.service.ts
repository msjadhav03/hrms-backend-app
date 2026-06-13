import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import brcypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthModuleConstants } from '../common/constants/messages';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PG_CONNECTION') private readonly db: Pool,
    private jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async validateCredentials(username: string, password: string) {
    try {
      const userQuery = `SELECT u.email, u.role, u.id, u.employee_id, u.password, e.fullname from users u INNER JOIN employees e ON u.email = e.official_mail WHERE u.email = $1`;
      const userData = await this.db.query(userQuery, [username]);
      if (
        userData.rows === undefined ||
        userData.rows == null ||
        userData.rows.length == 0
      ) {
        throw new HttpException(
          AuthModuleConstants.ERROR_MESSAGES.USER_NOT_FOUND,
          HttpStatus.FORBIDDEN,
        );
      }
      const isValidUser = await brcypt.compare(
        password,
        userData.rows[0].password,
      );
      if (isValidUser) {
        const payload = {
          sub: userData.rows[0].id,
          username: userData.rows[0].email,
          role: userData.rows[0].role,
          employee_id: userData.rows[0].employee_id,
        };
        return {
          statusCode: 200,
          message: AuthModuleConstants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
          data: {
            id: userData.rows[0].id,
            email: userData.rows[0].email,
            role: userData.rows[0].role,
            fullname: userData.rows[0].fullname,
            employee_id: userData.rows[0].employee_id,
            access_token: await this.jwtService.signAsync(payload),
          },
        };
      } else {
        throw new HttpException(
          `${AuthModuleConstants.ERROR_MESSAGES.INCORRECT_PASSWORD}`,
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
