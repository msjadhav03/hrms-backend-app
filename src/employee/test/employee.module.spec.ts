import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeModule } from '../employee.module';
import { EmployeeController } from '../employee.controller';
import { EmployeeService } from '../employee.service';

jest.mock('../../notification/notification.service', () => ({
  NotificationService: class {
    sendEmail = jest.fn().mockResolvedValue(undefined);
  },
}));

describe('EmployeeModule', () => {
  let moduleInstance: TestingModule;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };

    moduleInstance = await Test.createTestingModule({
      imports: [EmployeeModule],
    })
      .overrideProvider('PG_CONNECTION')
      .useValue(mockPool)
      .compile();
  });

  afterEach(async () => {
    if (moduleInstance) {
      await moduleInstance.close();
    }
    jest.clearAllMocks();
  });

  it('should compile the module successfully', () => {
    expect(moduleInstance).toBeDefined();
  });

  it('should successfully resolve and inject EmployeeController', () => {
    const controller =
      moduleInstance.get<EmployeeController>(EmployeeController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(EmployeeController);
  });

  it('should successfully resolve and inject EmployeeService', () => {
    const service = moduleInstance.get<EmployeeService>(EmployeeService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EmployeeService);
  });

  it('should correctly register database connection tokens (PG_CONNECTION)', () => {
    const dbConnection = moduleInstance.get('PG_CONNECTION');
    expect(dbConnection).toBeDefined();
    expect(dbConnection).toBe(mockPool);
  });
});
