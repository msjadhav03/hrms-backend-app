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
import { SeedingModule } from '../common/constants/messages';

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
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_CREATION_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `Seeding Service: Runtime error occured ${error.message}`,
      );
      throw InternalServerErrorException;
    }
  }

  async dropDatabase() {
    try {
      const result = await Promise.all([
        this.pool.query(`Drop table if exists employee cascade`),
        this.pool.query(`Drop table if exists user cascade`),
      ]);
      return {
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_DROP_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `Seeding Service: Runtime error occured - Error while droping tables ${error.message}`,
      );
      throw InternalServerErrorException;
    }
  }
}
