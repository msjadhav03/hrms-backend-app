import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-expection.filter';
import { DatabasePostgresModule } from './database/database.module';
import { SeeedingModule } from './seeding/seeding.module';
import { NotificationModule } from './notification/notification.module';
import { EmployeeModule } from './employee/employee.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticModule } from './analytics/analytic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
    DatabasePostgresModule,
    SeeedingModule,
    DashboardModule,
    EmployeeModule,
    AnalyticModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
