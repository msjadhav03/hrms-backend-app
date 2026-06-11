import { Test, TestingModule } from '@nestjs/testing';
import { SeedingService } from '../seeding.service';
import { Pool } from 'pg';
import { Worker } from 'worker_threads';
import {
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SeedingModule } from '../../common/constants/messages';
import { CreateEmployeeSchema } from '../../database/schema/employee.schema';
import { UserEmployeeSchema } from '../../database/schema/user.schema';

jest.mock('worker_threads', () => {
  return {
    Worker: jest.fn(),
  };
});

jest.mock('@nestjs/config', () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => ({
      get: jest.fn((key: string) => {
        const config = {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'test_user',
          POSTGRES_PASSWORD: 'test_password',
          POSTGRES_DB: 'test_db',
        };
        return config[key];
      }),
    })),
  };
});

describe('SeedingService', () => {
  let service: SeedingService;
  let mockPool: Partial<Pool>;
  let mockWorkerInstance: any;

  beforeEach(async () => {
    jest.mocked(Worker).mockImplementation(() => mockWorkerInstance);
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedingService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<SeedingService>(SeedingService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockWorkerInstance = {
      on: jest.fn(),
    };
    (Worker as unknown as jest.Mock).mockImplementation(
      () => mockWorkerInstance,
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDatabase', () => {
    it('should execute both queries and return a success message', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await service.createDatabase();

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(1, CreateEmployeeSchema);
      expect(mockPool.query).toHaveBeenNthCalledWith(2, UserEmployeeSchema);

      expect(result).toEqual({
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_CREATION_SUCCESS,
      });
    });

    it('should log an error and throw InternalServerErrorException when a query fails', async () => {
      const mockError = new Error('Database connection failed');
      (mockPool.query as jest.Mock).mockRejectedValue(mockError);
      await expect(service.createDatabase()).rejects.toBe(
        InternalServerErrorException,
      );
    });
  });

  describe('dropDatabase', () => {
    it(`should execute drop table queries and return a success message`, async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await service.dropDatabase();

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(
        1,
        `Drop table if exists employees cascade`,
      );
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        `Drop table if exists users cascade`,
      );
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_DROP_SUCCESS,
      });
    });

    it('should throw InternalServerErrorException reference when drop sequence hits an error', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(
        new Error('Deadlock detected'),
      );

      await expect(service.dropDatabase()).rejects.toBe(
        InternalServerErrorException,
      );
    });
  });

  describe('seedTable', () => {
    it('should send immediate success when 20s timeout window hits without worker failure', async () => {
      mockWorkerInstance.on.mockImplementation(() => mockWorkerInstance);

      const seedPromise = service.seedTable();
      jest.advanceTimersByTime(20000);

      const result = await seedPromise;

      expect(Worker).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_SEEDING_SUCCESS,
      });
    });

    it('should throw InternalServerErrorException if worker explicitly fails within the 20s safety window', async () => {
      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'message') {
            callback({ success: false, error: 'Database connection refused' });
          }
          return mockWorkerInstance;
        },
      );

      await expect(service.seedTable()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if worker process crashes (exit code 1) within 20s window', async () => {
      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'exit') {
            callback(1);
          }
          return mockWorkerInstance;
        },
      );

      await expect(service.seedTable()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should log background completion logs if worker resolves successfully AFTER the 20s response window', async () => {
      let savedMessageCallback: Function = () => {};

      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'message') savedMessageCallback = callback;
          return mockWorkerInstance;
        },
      );

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const seedPromise = service.seedTable();
      jest.advanceTimersByTime(20000);
      await seedPromise;

      savedMessageCallback({ success: true });

      await Promise.resolve();

      expect(loggerSpy).toHaveBeenCalledWith(
        SeedingModule.SUCCESS_MESSAGES.BACKGROUND_TASK_SUCCESS,
      );
    });
  });
});
