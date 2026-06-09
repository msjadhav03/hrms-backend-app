import { Test, TestingModule } from '@nestjs/testing';
import { SeedingController } from '../seeding.controller';
import { SeedingService } from '../seeding.service';

describe('SeedingController', () => {
  let controller: SeedingController;
  let mockSeedingService: Partial<SeedingService>;

  beforeEach(async () => {
    mockSeedingService = {
      seedUsers: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedingController],
      providers: [
        {
          provide: SeedingService,
          useValue: mockSeedingService,
        },
      ],
    }).compile();

    controller = module.get<SeedingController>(SeedingController);
  });

  it('Seeding should be defined', () => {
    expect(controller).toBeDefined();
  });
});
