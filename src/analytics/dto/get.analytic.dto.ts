import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAnalyticDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}
