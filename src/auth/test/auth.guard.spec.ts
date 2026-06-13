import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;

  const mockExecutionContext = (
    authHeader?: string,
  ): Partial<ExecutionContext> => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    reflector = module.get(Reflector);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the route is marked as public', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = mockExecutionContext() as ExecutionContext;
      const result = await authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if authorization header is missing', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = mockExecutionContext(undefined) as ExecutionContext;
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = mockExecutionContext(
        'Basic dummytoken123',
      ) as ExecutionContext;
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if jwt validation fails', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      configService.get.mockReturnValue('super-secret-key');
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const context = mockExecutionContext(
        'Bearer invalid_token',
      ) as ExecutionContext;
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid_token', {
        secret: 'super-secret-key',
      });
    });

    it('should successfully append payload to request and return true on valid token', async () => {
      const mockPayload = { sub: 1, username: 'testuser' };
      reflector.getAllAndOverride.mockReturnValue(false);
      configService.get.mockReturnValue('super-secret-key');
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const context = mockExecutionContext(
        'Bearer valid_token',
      ) as ExecutionContext;
      const requestMock = context.switchToHttp().getRequest();
      const result = await authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(requestMock['user']).toEqual(mockPayload);
    });
  });
});
