import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (
    userPayload?: any,
  ): Partial<ExecutionContext> => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: userPayload,
        }),
      }),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required for the route', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = mockExecutionContext() as ExecutionContext;

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user object is missing from request', () => {
      reflector.getAllAndOverride.mockReturnValue(['hr-manager']);
      const context = mockExecutionContext(undefined) as ExecutionContext;

      expect(() => rolesGuard.canActivate(context)).toThrow(
        new ForbiddenException('Access denied: User role missing'),
      );
    });

    it('should throw ForbiddenException if a standard user tries to access an hr-manager route', () => {
      reflector.getAllAndOverride.mockReturnValue(['hr-manager']);
      const context = mockExecutionContext({
        role: 'user',
      }) as ExecutionContext;
      expect(() => rolesGuard.canActivate(context)).toThrow(
        new ForbiddenException('Access denied: Insufficient permissions'),
      );
    });

    it('should return true when an hr-manager accesses an hr-manager designated route', () => {
      reflector.getAllAndOverride.mockReturnValue(['hr-manager']);
      const context = mockExecutionContext({
        role: 'hr-manager',
      }) as ExecutionContext;
      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when a standard user accesses a general user designated route', () => {
      reflector.getAllAndOverride.mockReturnValue(['user']);
      const context = mockExecutionContext({
        role: 'user',
      }) as ExecutionContext;
      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
