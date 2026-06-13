import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-expection.filter';
import { MODULE_METADATA } from '@nestjs/common/constants';

jest.mock('./database/database.module', () => ({
  DatabasePostgresModule: class {},
}));
jest.mock('./seeding/seeding.module', () => ({ SeeedingModule: class {} }));
jest.mock('./notification/notification.module', () => ({
  NotificationModule: class {},
}));
jest.mock('./employee/employee.module', () => ({ EmployeeModule: class {} }));
jest.mock('./auth/auth.module', () => ({ AuthModule: class {} }));
jest.mock('./dashboard/dashboard.module', () => ({
  DashboardModule: class {},
}));
jest.mock('./analytics/analytic.module', () => ({ AnalyticModule: class {} }));

describe('AppModule Initialization', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'JWT_SECRET') return 'test-jwt-secret-key-12345';
          return null;
        }),
      })
      .compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should compile and initialize the root AppModule module successfully', () => {
    expect(moduleRef).toBeDefined();
    const appModuleInstance = moduleRef.get<AppModule>(AppModule);
    expect(appModuleInstance).toBeInstanceOf(AppModule);
  });

  it('should correctly register the global HttpExceptionFilter via APP_FILTER token', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule);
    const matchingFilterProvider = providers.find(
      (provider: any) =>
        provider &&
        provider.provide === APP_FILTER &&
        provider.useClass === HttpExceptionFilter,
    );

    expect(matchingFilterProvider).toBeDefined();
  });

  it('should correctly evaluate the asynchronous JwtModule factory block using ConfigService', () => {
    const configService = moduleRef.get<ConfigService>(ConfigService);
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });
});
