import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { Pool } from 'pg';
import { CreateEmployeeSchema } from '../database/schema/employee.schema';
import { UserEmployeeSchema } from '../database/schema/user.schema';
import { SeedingModule } from '../common/constants/messages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedingService {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}
  private readonly logger = new Logger(SeedingService.name);
  async createDatabase() {
    try {
      await this.pool.query(CreateEmployeeSchema);
      await this.pool.query(UserEmployeeSchema);
      return {
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_CREATION_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${SeedingModule.ERROR_MESSAGES.TABLE_CREATION_FAILED} ${error.message}`,
      );
      throw InternalServerErrorException;
    }
  }

  async dropDatabase() {
    try {
      await this.pool.query(`Drop table if exists employees cascade`);
      await this.pool.query(`Drop table if exists users cascade`);
      return {
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_DROP_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${SeedingModule.ERROR_MESSAGES.TABLE_DELETION_FAILED} ${error.message}`,
      );
      throw InternalServerErrorException;
    }
  }

  private executeWorkerTask(): Promise<void> {
    const configService = new ConfigService();
    return new Promise((resolve, reject) => {
      const workerPath = path.resolve(
        __dirname,
        '../seeding/worker/seeding.utility.js',
      );
      const host = configService.get<string>('POSTGRES_HOST');
      const port = parseInt(
        configService.get<string>('POSTGRES_PORT') || '5432',
        10,
      );
      const user = configService.get<string>('POSTGRES_USER');
      const password = configService.get<string>('POSTGRES_PASSWORD');
      const database = configService.get<string>('POSTGRES_DB');
      const worker = new Worker(workerPath, {
        workerData: {
          user,
          password,
          host,
          port,
          database,
        },
      });

      worker.on('message', (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });

      worker.on('error', (err) => reject(err));
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  async seedTable() {
    try {
      this.logger.log(
        'Starting table creation on a background worker thread...',
      );
      const workerPromise = this.executeWorkerTask();
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 20000));
      await Promise.race([workerPromise, timerPromise]);
      workerPromise
        .then(() => {
          this.logger.log(
            `${SeedingModule.SUCCESS_MESSAGES.BACKGROUND_TASK_SUCCESS}`,
          );
        })
        .catch((bgError) => {
          this.logger.error(
            `${SeedingModule.ERROR_MESSAGES.BACKGROUND_PROCESS_FAILED}: ${bgError.message}`,
          );
        });
      return {
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_SEEDING_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${SeedingModule.ERROR_MESSAGES.TABLE_SEEDING_FAILED} ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
