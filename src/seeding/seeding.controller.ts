import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedingService } from './seeding.service';

@ApiTags('Seeding API: Create, seed')
@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}
}
