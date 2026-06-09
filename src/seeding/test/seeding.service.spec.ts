import { Test, TestingModule } from '@nestjs/testing';
import { SeedingService } from './seeding.service'; // Adjust path as needed
import { Pool } from 'pg';

describe('SeedingService', () => {
  let service: SeedingService;
  let mockPool: Partial<Pool>;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedingService,
        {
          provide: 'PG_CONNECTION',
          useValue: mockPool,
        },
      ],
    }).compile();
    service = module.get<SeedingService>(SeedingService);
  });

  it('Seedinf Service should be defined', () => {
    expect(service).toBeDefined();
  });
});
