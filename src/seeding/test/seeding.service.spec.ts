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
import { SuccessMessages } from '../../common/constants/messages';

describe('SeedingService', () => {
  let service: SeedingService;
  let mockPool: Partial<Pool>;

  beforeEach(async () => {
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
        message: SuccessMessages.TABLE_CREATION_SUCCESS,
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
});
