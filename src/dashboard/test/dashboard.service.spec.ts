import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import {
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DashboardModuleConstants } from '../../common/constants/messages';
import { FilterOptionDto } from '../dto/filter.dto';

describe('DashboardService', () => {
  let service: DashboardService;
  const mockPgConnection = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPgConnection,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildQuery', () => {
    it('should return an empty string if no filter is provided', () => {
      const result = service.buildQuery();
      expect(result).toBe('');
    });

    it('should append department to whereClause if department filter exists', () => {
      const filter: FilterOptionDto = { department: 'HR' };
      const result = service.buildQuery(filter);
      expect(result).toBe(" AND department = 'HR'");
    });

    it('should append country to whereClause if country filter exists', () => {
      const filter: FilterOptionDto = { country: 'US' };
      const result = service.buildQuery(filter);
      expect(result).toBe("AND country = 'US'");
    });

    it('should append both department and country if both filters exist', () => {
      const filter: FilterOptionDto = {
        department: 'Engineering',
        country: 'IN',
      };
      const result = service.buildQuery(filter);
      expect(result).toBe(" AND department = 'Engineering'AND country = 'IN'");
    });

    it('should catch errors and throw InternalServerErrorException', () => {
      const poisonousFilter = {
        get department() {
          throw new Error('Simulated runtime property error');
        },
        get country() {
          return 'US';
        },
      };
      expect(() => {
        service.buildQuery(poisonousFilter as any);
      }).toThrow(InternalServerErrorException);
    });
  });

  describe('getSalaryTrend', () => {
    const mockDbRows = [{ min: '50000', max: '150000', avg: '95000' }];

    it('should fetch salary trends without a WHERE clause when no filters are present', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockDbRows });
      const result = await service.getSalaryTrend();
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        'Select min(salary), max(salary), avg(salary) from employees',
      );
      expect(result).toEqual({
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_MIN_MAX_AVG,
        data: mockDbRows,
      });
    });

    it('should append WHERE clause correctly when only department filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockDbRows });
      const filter: FilterOptionDto = { department: 'Finance' };
      await service.getSalaryTrend(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "Select min(salary), max(salary), avg(salary) from employees WHERE 1=1  AND department = 'Finance'",
      );
    });

    it('should append WHERE clause correctly when only country filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: mockDbRows });
      const filter: FilterOptionDto = { country: 'CA' };
      await service.getSalaryTrend(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "Select min(salary), max(salary), avg(salary) from employees WHERE 1=1 AND country = 'CA'",
      );
    });

    it('should handle database query rejections and throw InternalServerErrorException', async () => {
      const dbError = new Error('Connection timeout');
      mockPgConnection.query.mockRejectedValueOnce(dbError);
      await expect(service.getSalaryTrend()).rejects.toThrow(
        new InternalServerErrorException('Connection timeout'),
      );
    });
  });

  describe('departmentWiseTrend', () => {
    const mockDepartmentRows = [
      { department: 'Engineering', count: '15' },
      { department: 'HR', count: '4' },
    ];

    it('should fetch department wise trends with default queries when no filters are present', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const result = await service.departmentWiseTrend();
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        'SELECT department, COUNT(*) from employees where 1=1 AND 1=1 AND 1=1 GROUP BY department',
      );
      expect(result).toEqual({
        status: 200,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_DEPARTMENT,
        data: mockDepartmentRows,
      });
    });

    it('should inject country query safely when only country filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = { country: 'US' };
      await service.departmentWiseTrend(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "SELECT department, COUNT(*) from employees where 1=1 AND country = 'US' AND 1=1 GROUP BY department",
      );
    });

    it('should inject department query safely when only department filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = { department: 'HR' };
      await service.departmentWiseTrend(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "SELECT department, COUNT(*) from employees where 1=1 AND 1=1 AND department = 'HR' GROUP BY department",
      );
    });

    it('should inject both country and department parameters when both filters are provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = {
        country: 'IN',
        department: 'Engineering',
      };
      await service.departmentWiseTrend(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "SELECT department, COUNT(*) from employees where 1=1 AND country = 'IN' AND department = 'Engineering' GROUP BY department",
      );
    });

    it('should log errors and throw InternalServerErrorException when database operation fails', async () => {
      const dbError = new Error('Database connection failed');
      mockPgConnection.query.mockRejectedValueOnce(dbError);

      await expect(service.departmentWiseTrend()).rejects.toThrow(
        new InternalServerErrorException('Database connection failed'),
      );
    });
  });

  describe('getSalaryTrendRecentYears', () => {
    const mockDepartmentRows = [
      { year: 2026, min: 2000, max: 40000, avg: 2000 },
      { year: 2025, min: 2000, max: 40000, avg: 2000 },
      { year: 2024, min: 2000, max: 40000, avg: 2000 },
      { year: 2023, min: 2000, max: 40000, avg: 2000 },
      { year: 2022, min: 2000, max: 40000, avg: 2000 },
      { year: 2021, min: 2000, max: 40000, avg: 2000 },
      { year: 2020, min: 2000, max: 40000, avg: 2000 },
      { year: 2019, min: 2000, max: 40000, avg: 2000 },
      { year: 2018, min: 2000, max: 40000, avg: 2000 },
      { year: 2017, min: 2000, max: 40000, avg: 2000 },
    ];

    it('should fetch salary trend of recent 10 years', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const result = await service.getSalaryTrendRecentYears();
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        'Select min(salary), max(salary), avg(salary), EXTRACT(YEAR from date_of_joining) from employees WHERE 1=1  group by EXTRACT(YEAR from date_of_joining) order by EXTRACT(YEAR from date_of_joining) desc limit 10',
      );
      expect(result).toEqual({
        status: 200,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_RECENT_SALARY,
        data: mockDepartmentRows,
      });
    });

    it('should inject country query safely when only country filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = { country: 'India' };
      await service.getSalaryTrendRecentYears(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "Select min(salary), max(salary), avg(salary), EXTRACT(YEAR from date_of_joining) from employees WHERE 1=1  AND country = 'India' group by EXTRACT(YEAR from date_of_joining) order by EXTRACT(YEAR from date_of_joining) desc limit 10",
      );
    });

    it('should inject department query safely when only department filter is provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = { department: 'HR' };
      await service.getSalaryTrendRecentYears(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "Select min(salary), max(salary), avg(salary), EXTRACT(YEAR from date_of_joining) from employees WHERE 1=1   AND department = 'HR' group by EXTRACT(YEAR from date_of_joining) order by EXTRACT(YEAR from date_of_joining) desc limit 10",
      );
    });

    it('should inject both country and department parameters when both filters are provided', async () => {
      mockPgConnection.query.mockResolvedValueOnce({
        rows: mockDepartmentRows,
      });
      const filter: FilterOptionDto = {
        country: 'India',
        department: 'Engineering',
      };
      await service.getSalaryTrendRecentYears(filter);
      expect(mockPgConnection.query).toHaveBeenCalledWith(
        "Select min(salary), max(salary), avg(salary), EXTRACT(YEAR from date_of_joining) from employees WHERE 1=1   AND department = 'Engineering'AND country = 'India' group by EXTRACT(YEAR from date_of_joining) order by EXTRACT(YEAR from date_of_joining) desc limit 10",
      );
    });

    it('should log errors and throw InternalServerErrorException when database operation fails', async () => {
      const dbError = new Error('Database connection failed');
      mockPgConnection.query.mockRejectedValueOnce(dbError);

      await expect(service.getSalaryTrendRecentYears()).rejects.toThrow(
        new InternalServerErrorException('Database connection failed'),
      );
    });
  });
});
