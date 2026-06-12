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
import { GetEmployeeDto } from '../dto/get.employee.dto';

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

  const mockGetByIdSuccessReponse = {
    status: HttpStatus.OK,
    message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
    data: {
      id: '10006',
      employee_code: 'EMP-8939000943',
      fullname: 'Manisha Jadhav',
      official_mail: 'manishajadhav0026@gmail.com',
      onboard_location: 'Pune',
      job_title: 'Senior Software Engineer',
      salary: '150000.00',
      date_of_joining: '2000-02-01T18:30:00.000Z',
      department: 'Human Resources',
      country: 'India',
      address_line: 'Kuber Park 1, Pune',
      city: 'Pune',
      state: 'Maharashtra',
      zip_code: '312421',
      personal_email: 'manishajadhav2323@gmail.com',
      contact_number: '2232278444',
      country_code: '91',
      gender: 'Female',
      married_status: 'Single',
      age: 28,
      date_of_birth: '1998-02-28T18:30:00.000Z',
      pan_id: 'BQDP2342S',
      is_deleted: false,
      created_at: '2026-06-12T00:14:40.537Z',
      updated_at: '2026-06-12T03:30:51.468Z',
      role: 'hr-manger',
    },
  };

  const mockGetEmployeeDto: GetEmployeeDto = {
    page: 1,
    size: 10,
    country: 'India',
    department: 'Engineering',
    search: 'Manisha',
  };

  const mockPaginatedResponse = {
    status: HttpStatus.OK,
    message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
    data: [{ id: 1, fullname: 'Manisha Jadhav', department: 'Engineering' }],
    totalCount: 1,
    page: 1,
    size: 10,
  };

  const mockDeleteSuccessResponse = {
    status: HttpStatus.OK,
    message: EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_DELETE_SUCCESS,
  };

  beforeEach(async () => {
    const mockEmployeeService = {
      createNewEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      findEmployeeById: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
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

  describe('findOne', () => {
    const targetId = 'EMP-1234567890';

    it('should call and pass payload to findOne and return success response with employeeDetails', async () => {
      jest
        .spyOn(service, 'findEmployeeById')
        .mockResolvedValue(mockGetByIdSuccessReponse);

      const result = await controller.findOne(targetId);

      expect(service.findEmployeeById).toHaveBeenCalledTimes(1);
      expect(service.findEmployeeById).toHaveBeenCalledWith(targetId);
      expect(result).toEqual(mockGetByIdSuccessReponse);
    });

    it('should log context and throw exceptions if the update execution fails', async () => {
      const serviceError = new InternalServerErrorException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(service, 'findEmployeeById').mockRejectedValue(serviceError);

      await expect(controller.findOne(targetId)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(controller.findOne(targetId)).rejects.toThrow(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('deleteOne', () => {
    const targetId = 'EMP-1234567890';

    it('should call and pass payload to findOne and return success response with employeeDetails', async () => {
      jest
        .spyOn(service, 'deleteOne')
        .mockResolvedValue(mockDeleteSuccessResponse);

      const result = await controller.deleteOne(targetId);

      expect(service.deleteOne).toHaveBeenCalledTimes(1);
      expect(service.deleteOne).toHaveBeenCalledWith(targetId);
      expect(result).toEqual(mockDeleteSuccessResponse);
    });

    it('should log context and throw exceptions if the update execution fails', async () => {
      const serviceError = new InternalServerErrorException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(service, 'deleteOne').mockRejectedValue(serviceError);

      await expect(controller.deleteOne(targetId)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(controller.deleteOne(targetId)).rejects.toThrow(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('getEmployees', () => {
    it('should pass payload to find and returning the expected data', async () => {
      jest.spyOn(service, 'find').mockResolvedValue(mockPaginatedResponse);
      const result = await controller.getEmployees(mockGetEmployeeDto);
      expect(service.find).toHaveBeenCalledTimes(1);
      expect(service.find).toHaveBeenCalledWith(mockGetEmployeeDto);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should call with page and size', async () => {
      const minimalDto: GetEmployeeDto = { page: 1, size: 5 };
      jest.spyOn(service, 'find').mockResolvedValue(mockPaginatedResponse);
      await controller.getEmployees(minimalDto);
      expect(service.find).toHaveBeenCalledWith(minimalDto);
    });

    it('should throw InternalServerError in case of failure', async () => {
      const serviceError = new InternalServerErrorException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(service, 'find').mockRejectedValue(serviceError);
      await expect(controller.getEmployees(mockGetEmployeeDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getEmployees(mockGetEmployeeDto)).rejects.toThrow(
        ErrorMessages.INTERNAL_SERVER_ERROR,
      );
    });
  });
});
