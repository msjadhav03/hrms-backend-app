import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';

describe('Auth Sevice', () => {
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();
    authService = module.get<AuthService>(AuthService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should service be defined', () => {
    expect(authService).toBeDefined();
  });
});
