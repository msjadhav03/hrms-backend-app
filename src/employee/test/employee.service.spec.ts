import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../employee.service';
import { NotificationService } from '../../notification/notification.service';
import {
  InternalServerErrorException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EmployeeModuleConstants } from '../../common/constants/messages';
import { CreateEmployeeDto } from '../dto/create.employee.dto';
import bcrypt from 'bcrypt';
import { UpdateEmployeeDto } from '../dto/update.employee.dto';
import { GetEmployeeDto } from '../dto/get.employee.dto';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockDbPool: any;
  let mockNotificationService: any;

  const mockCreateEmployeeDto: CreateEmployeeDto = {
    fullname: 'Manisha Jadhav',
    official_mail: 'manishajadhav0026@gmail.com',
    onboard_location: 'Pune',
    job_title: 'Software Engineer',
    salary: 195000,
    date_of_joining: '01-07-2026',
    department: 'Engineering',
    country: 'India',
    address_line: 'Hinjawadi Infotech Park',
    city: 'Pune',
    state: 'Maharashtra',
    zip_code: '411057',
    personal_email: 'manisha.personal@example.com',
    contact_number: '9876543210',
    country_code: '+91',
    gender: 'Female',
    married_status: 'Single',
    age: 28,
    date_of_birth: '01-01-1998',
    pan_id: 'ABCDE1234F',
  };

  beforeEach(async () => {
    mockDbPool = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    mockNotificationService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockDbPool,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('randomNumber', () => {
    it('should generate a 10-digit number', () => {
      const num = service.randomNumber();
      expect(num).toBeGreaterThanOrEqual(1000000000);
      expect(num).toBeLessThanOrEqual(9999999999);
    });

    it('should throw an InternalServerErrorException if math generation fails', () => {
      jest.spyOn(Math, 'random').mockImplementation(() => {
        throw new Error('Random generation crash');
      });

      try {
        service.randomNumber();
        fail(
          'Expected randomNumber() to throw an exception, but it succeeded.',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe(
          EmployeeModuleConstants.ERROR_MESSAGES
            .FAILED_GENERATING_RANDOM_PASSWORD,
        );
      }
    });
  });

  describe('generateRandomString', () => {
    it('should generate a 10-character alphanumeric password string', () => {
      const str = service.generateRandomString();
      expect(str).toHaveLength(10);
      expect(str).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('generatePassword', () => {
    it('should hash the password string accurately using bcrypt', async () => {
      const bcryptSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashed_mock_string');
      const result = await service.generatePassword('raw_password_abc');

      expect(bcryptSpy).toHaveBeenCalledWith('raw_password_abc', 10);
      expect(result).toBe('hashed_mock_string');
    });

    it('should throw instantiated InternalServerErrorException if bcrypt processing fails', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        throw new Error('Crypto framework crash');
      });

      await expect(service.generatePassword('raw_password')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generatePassword('raw_password')).rejects.toThrow(
        EmployeeModuleConstants.ERROR_MESSAGES.FAILED_PASSWORD_HASHING,
      );
    });
  });

  describe('createNewEmployee', () => {
    it('should save employee and user entries, then send a credentials email', async () => {
      const fixedRandomStr = 'MANISHA026';
      const fixedRandomNum = 8888888888;
      const hashedPassMock = 'hashed_pass_value';

      jest
        .spyOn(service, 'generateRandomString')
        .mockReturnValue(fixedRandomStr);
      jest.spyOn(service, 'randomNumber').mockReturnValue(fixedRandomNum);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassMock);

      const response = await service.createNewEmployee(mockCreateEmployeeDto);

      expect(response).toEqual({
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS,
      });

      expect(mockDbPool.query).toHaveBeenCalledTimes(2);

      const userQueryArgs = mockDbPool.query.mock.calls[1];
      expect(userQueryArgs[1]).toEqual([
        mockCreateEmployeeDto.official_mail,
        hashedPassMock,
        'user',
        `EMP-${fixedRandomNum}`,
        false,
      ]);

      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith({
        name: mockCreateEmployeeDto.fullname,
        email: mockCreateEmployeeDto.official_mail,
        password: fixedRandomStr,
      });
    });

    it('should apply an "hr-manger" role', async () => {
      const hrEmployeeDto = {
        ...mockCreateEmployeeDto,
        department: 'Human Resources',
      };

      jest.spyOn(service, 'generateRandomString').mockReturnValue('HRMOCK1234');
      jest.spyOn(service, 'randomNumber').mockReturnValue(9999999999);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashed_hr_pass');

      await service.createNewEmployee(hrEmployeeDto);

      const userQueryArgs = mockDbPool.query.mock.calls[1];
      expect(userQueryArgs[1][2]).toBe('hr-manger');
    });

    it('should catch query failure and throw InternalServerErrorException wrapper', async () => {
      const dbErrorMessage = 'Connection pool timeout';
      mockDbPool.query.mockRejectedValue(new Error(dbErrorMessage));

      await expect(
        service.createNewEmployee(mockCreateEmployeeDto),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        service.createNewEmployee(mockCreateEmployeeDto),
      ).rejects.toThrow(dbErrorMessage);
    });
  });

  describe('UpdateEmploye', () => {
    const targetId = 'EMP-9876543210';
    const mockUpdateEmployeeDto: UpdateEmployeeDto = {
      fullname: 'Manisha Jadhav',
      official_mail: 'manishajadhav0026@gmail.com',
      onboard_location: 'Pune',
      job_title: 'Senior Software Engineer',
      salary: 120000,
      date_of_joining: '2026-07-01',
      department: 'Engineering',
      country: 'India',
      address_line: 'Hinjawadi Phase 3',
      city: 'Pune',
      state: 'Maharashtra',
      zip_code: '411057',
      personal_email: 'manisha.personal@example.com',
      contact_number: '9876543210',
      country_code: '+91',
      gender: 'Female',
      married_status: 'Single',
      age: 25,
      date_of_birth: '2001-01-01',
      pan_id: 'ABCDE1234F',
    };
    it('should successfully update employee', async () => {
      const response = await service.updateEmployee(
        targetId,
        mockUpdateEmployeeDto,
      );

      expect(response).toEqual({
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_UPDATE_SUCCESS,
      });

      expect(mockDbPool.query).toHaveBeenCalledTimes(2);
      const employeeQueryArgs = mockDbPool.query.mock.calls[0];
      expect(employeeQueryArgs[1][20]).toBe(targetId);

      const userQueryArgs = mockDbPool.query.mock.calls[1];
      expect(userQueryArgs[1]).toEqual(['user', targetId]);
    });

    it('should map user role mapping to "hr-manger" if the department is Human Resources', async () => {
      const hrUpdateDto = {
        ...mockUpdateEmployeeDto,
        department: 'Human Resources',
      };
      await service.updateEmployee(targetId, hrUpdateDto);

      const userQueryArgs = mockDbPool.query.mock.calls[1];
      expect(userQueryArgs[1]).toEqual(['hr-manger', targetId]);
    });

    it('should throw an InternalServerErrorException if the database errors out', async () => {
      const dbError = new Error('Deadlock detected or connection closed');
      mockDbPool.query.mockRejectedValue(dbError);

      const errorLoggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.updateEmployee(targetId, mockUpdateEmployeeDto),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        service.updateEmployee(targetId, mockUpdateEmployeeDto),
      ).rejects.toThrow('Deadlock detected or connection closed');

      expect(errorLoggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_UPDATE_FAILED,
        ),
      );
    });
  });

  describe('findEmployeeById', () => {
    const targetId = 'EMP-9876543210';
    const mockJoinedEmployeeRow = {
      employee_code: targetId,
      fullname: 'Manisha Jadhav',
      official_mail: 'manishajadhav0026@gmail.com',
      department: 'Engineering',
      job_title: 'Software Engineer',
      salary: 95000,
      is_deleted: false,
      role: 'user',
    };

    const mockGetByIdSuccessResponse = {
      status: HttpStatus.OK,
      message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
      data: mockJoinedEmployeeRow,
    };

    it('should successfully execute the inner join query and return a single employee object containing the matched user role', async () => {
      mockDbPool.query.mockResolvedValue({ rows: [mockJoinedEmployeeRow] });

      const response = await service.findEmployeeById(targetId);

      expect(response).toEqual(mockGetByIdSuccessResponse);
      expect(mockDbPool.query).toHaveBeenCalledTimes(1);

      const queryArgs = mockDbPool.query.mock.calls[0];
      expect(queryArgs[0]).toContain(
        'SELECT e.*, u.role from employees e INNER JOIN users u',
      );
      expect(queryArgs[0]).toContain(
        'where e.employee_code = $1 AND e.is_deleted = false',
      );
      expect(queryArgs[1]).toEqual([targetId]);
    });

    it('should return empty array data if no employee matches the target id', async () => {
      mockDbPool.query.mockResolvedValue({ rows: [] });

      const response = await service.findEmployeeById(targetId);
      expect(response).toEqual({
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
        data: [],
      });
    });

    it('should log execution errors to console and throw InternalServerErrorException', async () => {
      const dbErrorMessage = 'Query read timeout on primary replica';
      mockDbPool.query.mockRejectedValue(new Error(dbErrorMessage));

      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});
      await expect(service.findEmployeeById(targetId)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(service.findEmployeeById(targetId)).rejects.toThrow(
        dbErrorMessage,
      );
    });
  });

  describe('deleteOne', () => {
    const targetId = 'EMP-9876543210';
    it('should successfully delete employee', async () => {
      const response = await service.deleteOne(targetId);

      expect(response).toEqual({
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_DELETE_SUCCESS,
      });

      expect(mockDbPool.query).toHaveBeenCalledTimes(1);
      const queryArgs = mockDbPool.query.mock.calls[0];
      expect(queryArgs[1][0]).toBe(targetId);
    });

    it('should throw an InternalServerErrorException if the database errors out', async () => {
      const dbError = new Error('Deadlock detected or connection closed');
      mockDbPool.query.mockRejectedValue(dbError);

      const errorLoggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.deleteOne(targetId)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(service.deleteOne(targetId)).rejects.toThrow(
        'Deadlock detected or connection closed',
      );

      expect(errorLoggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_DELETION_FAILED,
        ),
      );
    });
  });

  describe('find', () => {
    it('should return paginated employee list without any filters successfully', async () => {
      const dto: GetEmployeeDto = { page: 1, size: 10 };
      const mockEmployees = [
        { id: 1, fullname: 'John Doe' },
        { id: 2, fullname: 'Jane Doe' },
      ];
      mockDbPool.query
        .mockResolvedValueOnce({ rows: [{ count: 2 }] })
        .mockResolvedValueOnce({ rows: mockEmployees });

      const result = await service.find(dto);

      expect(result).toEqual({
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
        data: mockEmployees,
        totalCount: 2,
        page: 1,
        size: 10,
      });

      expect(mockDbPool.query).toHaveBeenCalledTimes(2);
      const dataQueryArgs = mockDbPool.query.mock.calls[1];
      expect(dataQueryArgs[1]).toEqual([10, 0]);
    });

    it('should correctly build queries when filtering by country, department, and search keywords', async () => {
      const dto: GetEmployeeDto = {
        page: 2,
        size: 5,
        country: 'India',
        department: 'Engineering',
        search: 'Manisha',
      };

      mockDbPool.query
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })
        .mockResolvedValueOnce({
          rows: [{ id: 9, fullname: 'Manisha Jadhav' }],
        });

      await service.find(dto);

      const countQueryCall = mockDbPool.query.mock.calls[0];
      expect(countQueryCall[0]).toContain(
        'WHERE is_deleted = false AND country = $1 AND department = $2 AND fullname ILIKE $3',
      );
      expect(countQueryCall[1]).toEqual(['India', 'Engineering', '%Manisha%']);
      const dataQueryCall = mockDbPool.query.mock.calls[1];
      expect(dataQueryCall[1]).toEqual([
        'India',
        'Engineering',
        '%Manisha%',
        5,
        5,
      ]);
    });

    it('should return empty collection arrays if no entries match filter or/and search', async () => {
      const dto: GetEmployeeDto = { page: 1, size: 10, country: 'Mars' };

      mockDbPool.query
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: null });

      const result = await service.find(dto);
      expect(result.data).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should bubble up an InternalServerErrorException if any running database command errors out', async () => {
      const dto: GetEmployeeDto = { page: 1, size: 10 };
      mockDbPool.query.mockRejectedValue(
        new Error('Relation "employees" does not exist'),
      );
      await expect(service.find(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.find(dto)).rejects.toThrow(
        'Relation "employees" does not exist',
      );
    });
  });
});
