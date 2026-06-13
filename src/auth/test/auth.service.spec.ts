import { Test, TestingModule } from '@nestjs/testing';
import brcypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthModuleConstants } from '../../common/constants/messages';

jest.mock('bcrypt');

describe('Auth Sevice', () => {
  let authService: AuthService;

  const mockPgConnection = {
    query: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPgConnection,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should service be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateCredentials', () => {
    const mockUsername = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashedPassword123';

    const mockUserData = {
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      fullname: 'John Doe',
      employee_id: 'EMP001',
      password: mockHashedPassword,
    };

    it('should successfully login a valid user and return a JWT token', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: [mockUserData] });
      (brcypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockResolvedValueOnce('mocked_jwt_token');

      const result = await authService.validateCredentials(
        mockUsername,
        mockPassword,
      );
      expect(mockPgConnection.query).toHaveBeenCalledWith(expect.any(String), [
        mockUsername,
      ]);
      expect(brcypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUserData.id,
        username: mockUserData.email,
        role: mockUserData.role,
        employee_id: mockUserData.employee_id,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: AuthModuleConstants.SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          id: mockUserData.id,
          email: mockUserData.email,
          role: mockUserData.role,
          fullname: mockUserData.fullname,
          employee_id: mockUserData.employee_id,
          access_token: 'mocked_jwt_token',
        },
      });
    });

    it('should throw FORBIDDEN error if user is not found in database', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: [] });
      await expect(
        authService.validateCredentials(mockUsername, mockPassword),
      ).rejects.toThrow(
        new HttpException(
          AuthModuleConstants.ERROR_MESSAGES.USER_NOT_FOUND,
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should throw FORBIDDEN error if userData.rows is undefined or null', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: undefined });
      await expect(
        authService.validateCredentials(mockUsername, mockPassword),
      ).rejects.toThrow(
        new HttpException(
          AuthModuleConstants.ERROR_MESSAGES.USER_NOT_FOUND,
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should throw UNAUTHORIZED error if password validation fails', async () => {
      mockPgConnection.query.mockResolvedValueOnce({ rows: [mockUserData] });
      (brcypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.validateCredentials(mockUsername, mockPassword),
      ).rejects.toThrow(
        new HttpException(
          AuthModuleConstants.ERROR_MESSAGES.INCORRECT_PASSWORD,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should log and rethrow errors when an unexpected error occurs', async () => {
      const dbError = new Error('Database connection timed out');
      mockPgConnection.query.mockRejectedValueOnce(dbError);

      await expect(
        authService.validateCredentials(mockUsername, mockPassword),
      ).rejects.toThrow(dbError);
    });
  });
});
