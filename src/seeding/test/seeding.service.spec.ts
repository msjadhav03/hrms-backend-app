import { Test, TestingModule } from '@nestjs/testing';
import { SeedingService } from '../seeding.service';
import { Pool } from 'pg';
import {
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CreateEmployeeSchema } from '../../database/schema/employee.schema';
import { UserEmployeeSchema } from '../../database/schema/user.schema';
import { SeedingModule } from '../../common/constants/messages';
import { ConfigService } from '@nestjs/config';

describe('SeedingService', () => {
let service: SeedingService;
  let mockPool: Partial<Pool>;
  let mockConfigService: Partial<ConfigService>;
  let mockWorkerInstance: any;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };
    mockConfigService = {
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedingService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPool,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<SeedingService>(SeedingService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockWorkerInstance = {
      on: jest.fn(),
    };
    (Worker as jest.Mock).mockImplementation(() => mockWorkerInstance);

  });

  afterEach(() => {
    jest.clearAllMocks();
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
        message: SeedingModule.SUCCESS_MESSAGES.TABLE_CREATION_SUCCESS,,
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
          `Drop table if exists employee cascade`,
        );
        expect(mockPool.query).toHaveBeenNthCalledWith(
          2,
          `Drop table if exists user cascade`,
        );
      });
  });
    
});
