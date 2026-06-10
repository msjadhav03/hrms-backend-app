import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateEmployeeSchema } from '../database/schema/employee.schema';
import { UserEmployeeSchema } from '../database/schema/user.schema';
import { SuccessMessages } from '../common/constants/messages';

@Injectable()
export class SeedingService {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  private readonly logger = new Logger(SeedingService.name);
  async createDatabase() {
    try {
      const result = await Promise.all([
        this.pool.query(CreateEmployeeSchema),
        this.pool.query(UserEmployeeSchema),
      ]);
      return {
        status: HttpStatus.OK,
        message: SuccessMessages.TABLE_CREATION_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `Seeding Service: Runtime error occured ${error.message}`,
      );
      throw InternalServerErrorException;
    }
  }
}
