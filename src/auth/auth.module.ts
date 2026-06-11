import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DatabaseProviders } from '../database/database.service';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [...DatabaseProviders, AuthService],
})
export class AuthModule {}
