import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SeedingService {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}
}
