import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import fs from 'fs';
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
  private readonly configService: ConfigService;
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

  private executeWorkerTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      const workerPath = path.resolve(
        __dirname,
        '../seeding/worker/seeding.utility.js',
      );

      this.logger.log(`Here is worker path ------>`, workerPath);

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
      await this.executeWorkerTask();

      return {
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_SEEDING_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `Seeding Service: Worker Runtime error occurred: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
