import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticService } from '../analytic.service';
import {
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AnalyticModuleConstants } from '../../common/constants/messages';
import { GetAnalyticDto } from '../dto/get.analytic.dto';

describe('Analytic Service', () => {
  let analyticService: AnalyticService;
  const mockPgConnection = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPgConnection,
        },
      ],
    }).compile();

    analyticService = module.get<AnalyticService>(AnalyticService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(analyticService).toBeDefined();
  });

  describe('buildQuery', () => {
    it('should build query with a default AND 1=1 clause when country is missing', () => {
      const dto: GetAnalyticDto = {};
      const baseQuery = 'SELECT * FROM employees WHERE 1=1';
      const result = analyticService.buildQuery(dto, baseQuery);
      expect(result).toBe('SELECT * FROM employees WHERE 1=1 AND 1=1');
    });

    it('should append country criteria when country is provided', () => {
      const dto: GetAnalyticDto = { country: 'India' };
      const baseQuery = 'SELECT * FROM employees WHERE 1=1';
      const result = analyticService.buildQuery(dto, baseQuery);
      expect(result).toBe(
        "SELECT * FROM employees WHERE 1=1 AND 1=1 AND country = 'India'",
      );
    });

    it('should catch errors and throw an InternalServerErrorException', () => {
      const poisonousDto = {
        get country() {
          throw new Error('Property error');
        },
      };
      expect(() => {
        analyticService.buildQuery(poisonousDto as any, 'SELECT *');
      }).toThrow(InternalServerErrorException);
    });
  });

  describe('fetchData', () => {
    it('should execute query and return response rows directly', async () => {
      const mockRows = [{ id: 1 }, { id: 2 }];
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockRows });
      const result = await analyticService.fetchData('SELECT *');
      expect(mockPgConnection.query).toHaveBeenCalledWith('SELECT *');
      expect(result).toEqual(mockRows);
    });
    it('should throw InternalServerErrorException if query database operation crashes', async () => {
      mockPgConnection.query.mockRejectedValueOnce(new Error('DB crash'));
      await expect(analyticService.fetchData('SELECT *')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findCountOfEntities', () => {
    const mockConsoleSpy = () =>
      jest.spyOn(console, 'log').mockImplementation(() => {});

    it('should resolve all promises and return data', async () => {
      const consoleSpy = mockConsoleSpy();
      const dto: GetAnalyticDto = { country: 'India' };
      mockPgConnection.query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ count: '12' }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await analyticService.findCountOfEntities(dto);
      expect(mockPgConnection.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_ENTITY_COUNT,
        data: [
          {
            employeeCount: '100',
            departmentCount: '5',
            jobTitleCount: '12',
            countryCount: '1',
          },
        ],
      });
      consoleSpy.mockRestore();
    });

    it('should catch and thrown by child sub-queries and report InternalServerErrorException', async () => {
      const consoleSpy = mockConsoleSpy();
      const dto: GetAnalyticDto = {};
      mockPgConnection.query.mockRejectedValueOnce(
        new Error('Promise execution failure'),
      );
      await expect(analyticService.findCountOfEntities(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('findTopMostPaidJobs', () => {
    const mockConsoleSpy = () =>
      jest.spyOn(console, 'log').mockImplementation(() => {});

    it('should return top most paid jobs matching filter', async () => {
      const consoleSpy = mockConsoleSpy();
      const dto: GetAnalyticDto = { country: 'India' };
      const mockJobs = [{ job_title: 'SDE', salary: 150000 }];
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockJobs });
      const result = await analyticService.findTopMostPaidJobs(dto);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "SELECT job_title,salary from employees where 1=1 AND 1=1 AND country = 'India' ORDER BY salary DESC LIMIT 10",
      );
      expect(result).toEqual({
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_TOP_MOST_PAID_JOBS,
        data: mockJobs,
      });
      consoleSpy.mockRestore();
    });

    it('should throw InternalServerErrorException if dynamic data generation breaks down', async () => {
      const consoleSpy = mockConsoleSpy();
      mockPgConnection.query.mockRejectedValueOnce(
        new Error('Query execution breakdown'),
      );
      await expect(analyticService.findTopMostPaidJobs({})).rejects.toThrow(
        InternalServerErrorException,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('findTopMostPaidDepartment', () => {
    const mockConsoleSpy = () =>
      jest.spyOn(console, 'log').mockImplementation(() => {});

    it('should aggregate matching payload metrics ', async () => {
      const consoleSpy = mockConsoleSpy();
      const dto: GetAnalyticDto = { country: 'India' };
      const mockDepartments = [
        { department: 'Engineering', total_salary: 500000 },
      ];
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockDepartments });
      const result = await analyticService.findTopMostPaidDepartment(dto);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "SELECT department, SUM(salary) as total_salary from employees where 1=1 AND 1=1 AND country = 'India' group by department ORDER BY total_salary DESC LIMIT 10",
      );
      expect(result).toEqual({
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_TOP_MOST_PAID_DEPARTMENT,
        data: mockDepartments,
      });
      consoleSpy.mockRestore();
    });

    it('should catch query runtime exceptions and rethrow exceptions', async () => {
      const consoleSpy = mockConsoleSpy();
      mockPgConnection.query.mockRejectedValueOnce(
        new Error('Aggregation syntax error'),
      );
      await expect(
        analyticService.findTopMostPaidDepartment({}),
      ).rejects.toThrow(InternalServerErrorException);
      consoleSpy.mockRestore();
    });
  });
});
