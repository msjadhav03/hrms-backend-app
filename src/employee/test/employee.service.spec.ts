import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeService],
    }).compile();
    service = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
