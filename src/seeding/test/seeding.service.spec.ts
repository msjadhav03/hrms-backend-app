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

// 1. Mock the native Node.js worker_threads module entirely
jest.mock('worker_threads', () => {
  return {
    Worker: jest.fn(),
  };
});

// 2. Mock @nestjs/config to handle the inline "new ConfigService()" instantiation
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

    // Suppress console logger noise during testing
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    // Setup fresh Worker Mock Instance for event interception
    mockWorkerInstance = {
      on: jest.fn(),
    };
    // Cast to unknown first to safely bypass structural comparison guards
    (Worker as unknown as jest.Mock).mockImplementation(
      () => mockWorkerInstance,
    );
    // Use fake timers to handle the 20-second race conditions gracefully
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // TESTS FOR: createDatabase()
  // ==========================================
  describe('createDatabase', () => {
    it('should successfully run structural schemas sequentially', async () => {
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

    it('should throw InternalServerErrorException reference on structural query crashes', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(
        new Error('Query Timeout Error'),
      );

      await expect(service.createDatabase()).rejects.toBe(
        InternalServerErrorException,
      );
    });
  });

  // ==========================================
  // TESTS FOR: dropDatabase()
  // ==========================================
  describe('dropDatabase', () => {
    it('should run drop query strings sequentially', async () => {
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

  // ==========================================
  // TESTS FOR: seedTable() [Promise.race logic]
  // ==========================================
  describe('seedTable', () => {
    it('should send immediate success when 20s timeout window hits without worker failure', async () => {
      // Arrange: Worker does nothing, keeping the promise pending indefinitely
      mockWorkerInstance.on.mockImplementation(() => mockWorkerInstance);

      // Act: Start execution
      const seedPromise = service.seedTable();

      // Fast-forward time past your 20-second threshold timer
      jest.advanceTimersByTime(20000);

      const result = await seedPromise;

      // Assert
      expect(Worker).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_SEEDING_SUCCESS,
      });
    });

    it('should throw InternalServerErrorException if worker explicitly fails within the 20s safety window', async () => {
      // Arrange: Worker instantly throws an execution exception
      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'message') {
            callback({ success: false, error: 'Database connection refused' });
          }
          return mockWorkerInstance;
        },
      );

      // Act & Assert
      await expect(service.seedTable()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if worker process crashes (exit code 1) within 20s window', async () => {
      // Arrange: Force abnormal worker termination event loop
      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'exit') {
            callback(1);
          }
          return mockWorkerInstance;
        },
      );

      // Act & Assert
      await expect(service.seedTable()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should log background completion logs if worker resolves successfully AFTER the 20s response window', async () => {
      let savedMessageCallback: Function = () => {};

      // Capture callback references so we can fire them whenever we choose manually
      mockWorkerInstance.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === 'message') savedMessageCallback = callback;
          return mockWorkerInstance;
        },
      );

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      // 1. Kick off process and pass the 20s mark to resolve the race condition
      const seedPromise = service.seedTable();
      jest.advanceTimersByTime(20000);
      await seedPromise;

      // 2. Simulate worker resolving successfully long after HTTP response was already transmitted
      savedMessageCallback({ success: true });

      // Allow microtask queue to clear up promises attached to `.then()`
      await Promise.resolve();

      expect(loggerSpy).toHaveBeenCalledWith(
        SeedingModule.SUCCESS_MESSAGES.BACKGROUND_TASK_SUCCESS,
      );
    });
  });
});
