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

  // src/employee/test/employee.service.spec.ts

  describe('randomNumber', () => {
    it('should generate a 10-digit number format pool', () => {
      const num = service.randomNumber();
      expect(num).toBeGreaterThanOrEqual(1000000000);
      expect(num).toBeLessThanOrEqual(9999999999);
    });

    it('should throw an instantiated InternalServerErrorException if math generation fails', () => {
      // 1. Force Math.random to fail out intentionally
      jest.spyOn(Math, 'random').mockImplementation(() => {
        throw new Error('Random generation crash');
      });

      // 2. Use an explicit try/catch framework for accurate object validation
      try {
        service.randomNumber();
        // If it doesn't throw, explicitly fail the test
        fail(
          'Expected randomNumber() to throw an exception, but it succeeded.',
        );
      } catch (error) {
        // 3. Inspect the thrown exception properties precisely
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
    it('should save employee and user entries, then dispatch a credentials email', async () => {
      const fixedRandomStr = 'MANISHA026';
      const fixedRandomNum = 8888888888;
      const hashedPassMock = 'enc_hashed_pass_value';

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

    it('should apply an "hr-manger" role instead of "user" if assigned to the Human Resources department', async () => {
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

    it('should catch query breaks and bubble up an InternalServerErrorException wrapper', async () => {
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
});
