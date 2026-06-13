import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import {
  HttpStatus,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthModuleConstants } from '../../common/constants/messages';
import { LoginDto } from '../dto/login.dto';

describe('Auth Controller', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockLoginDto: LoginDto = {
    username: 'aaransh.bhosale@company.com',
    password: 'SecurePassword123!',
  };

  const mockLoginSuccessResponse = {
    statusCode: HttpStatus.OK,
    message: AuthModuleConstants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      id: '1',
      role: 'hr-manager',
      email: 'manishajadhav@gmail.com',
      fullname: 'Manisha Jadhav',
      employee_id: 'EMP-211299',
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenPayload...',
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateCredentials: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
      controllers: [AuthController],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should controller be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should pass credentials down to authService.validateCredentials and return success response with access_token and other fields', async () => {
      jest
        .spyOn(authService, 'validateCredentials')
        .mockResolvedValue(mockLoginSuccessResponse);
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const result = await authController.login(mockLoginDto);

      expect(authService.validateCredentials).toHaveBeenCalledTimes(1);
      expect(authService.validateCredentials).toHaveBeenCalledWith(
        mockLoginDto.username,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockLoginSuccessResponse);

      expect(consoleLogSpy).toHaveBeenCalledWith(mockLoginDto);
      consoleLogSpy.mockRestore();
    });

    it('should bubble up 403 Forbidden exceptions if credential validation fail', async () => {
      jest
        .spyOn(authService, 'validateCredentials')
        .mockRejectedValue(
          new ForbiddenException(AuthModuleConstants.ERROR_MESSAGES.FORBIDDEN),
        );

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        ForbiddenException,
      );

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        AuthModuleConstants.ERROR_MESSAGES.FORBIDDEN,
      );
    });

    it('should throw InternalServerErrorExceptions if a database connection error occurs', async () => {
      jest
        .spyOn(authService, 'validateCredentials')
        .mockRejectedValue(
          new InternalServerErrorException(
            AuthModuleConstants.ERROR_MESSAGES.LOGIN_FAILED,
          ),
        );
      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        AuthModuleConstants.ERROR_MESSAGES.LOGIN_FAILED,
      );
    });
  });
});
