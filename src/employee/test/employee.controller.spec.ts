import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from '../employee.controller';
import { EmployeeService } from '../employee.service';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import {
  EmployeeModuleConstants,
  ErrorMessages,
} from '../../common/constants/messages';
import { CreateEmployeeDto } from '../dto/create.employee.dto';
import { UpdateEmployeeDto } from '../dto/update.employee.dto';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  const mockCreateDto: CreateEmployeeDto = {
    fullname: 'Manisha Jadhav',
    official_mail: 'manishajadhav0026@gmail.com',
    onboard_location: 'Pune',
    job_title: 'Software Engineer',
    salary: 2925000,
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
    age: 25,
    date_of_birth: '2001-01-01',
    pan_id: 'ABCDE1234F',
  };

  const mockUpdateDto: UpdateEmployeeDto = {
    job_title: 'Senior Software Engineer',
    salary: 120000,
  };

  const mockCreationSuccessResponse = {
    status: HttpStatus.OK,
    message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS,
  };

  const mockUpdateSuccessResponse = {
    status: HttpStatus.OK,
    message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_UPDATE_SUCCESS,
  };

  beforeEach(async () => {
    const mockEmployeeService = {
      createNewEmployee: jest.fn(),
      updateEmployee: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEmployee', () => {
    it('should call createNewEmployee with payload and return success status', async () => {
      jest
        .spyOn(service, 'createNewEmployee')
        .mockResolvedValue(mockCreationSuccessResponse);

      const result = await controller.createEmployee(mockCreateDto);

      expect(service.createNewEmployee).toHaveBeenCalledTimes(1);
      expect(service.createNewEmployee).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockCreationSuccessResponse);
    });

    it('should throw exceptions if the service fails during creation', async () => {
      const serviceError = new InternalServerErrorException(
        EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_CREATION_FAILED,
      );
      jest.spyOn(service, 'createNewEmployee').mockRejectedValue(serviceError);

      await expect(controller.createEmployee(mockCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(controller.createEmployee(mockCreateDto)).rejects.toThrow(
        EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_CREATION_FAILED,
      );
    });
  });

  describe('updateEmployee', () => {
    const targetId = 'EMP-1234567890';

    it('should call and pass payload to updateEmployee and return update validation', async () => {
      jest
        .spyOn(service, 'updateEmployee')
        .mockResolvedValue(mockUpdateSuccessResponse);

      const result = await controller.updateEmployee(targetId, mockUpdateDto);

      expect(service.updateEmployee).toHaveBeenCalledTimes(1);
      expect(service.updateEmployee).toHaveBeenCalledWith(
        targetId,
        mockUpdateDto,
      );
      expect(result).toEqual(mockUpdateSuccessResponse);
    });

    it('should log context and throw exceptions if the update execution fails', async () => {
      const serviceError = new InternalServerErrorException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(service, 'updateEmployee').mockRejectedValue(serviceError);

      await expect(
        controller.updateEmployee(targetId, mockUpdateDto),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        controller.updateEmployee(targetId, mockUpdateDto),
      ).rejects.toThrow(ErrorMessages.INTERNAL_SERVER_ERROR);
    });
  });
});
