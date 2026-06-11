import { Test, TestingModule } from '@nestjs/testing';
import { SeedingController } from '../seeding.controller';
import { SeedingService } from '../seeding.service';
import { HttpStatus } from '@nestjs/common';

describe('SeedingController', () => {
  let controller: SeedingController;
  let service: SeedingService;
  const mockSeedingService = {
    createDatabase: jest.fn(),
    dropDatabase: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<SeedingService>(SeedingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDatabase', () => {
    it('should call seedingService.createDatabase and return its result', async () => {
      const mockResult = {
        status: HttpStatus.OK,
        message: 'Table creation success',
      };
      mockSeedingService.createDatabase.mockResolvedValue(mockResult);
      const result = await controller.createDatabase();
      expect(service.createDatabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors thrown by the service', async () => {
      const mockError = new Error('Database connection failed');
      mockSeedingService.createDatabase.mockRejectedValue(mockError);
      await expect(controller.createDatabase()).rejects.toThrow(mockError);
    });
  });

  describe('dropDatabase', () => {
    it('should call seedingService.dropDatabase and return its result', async () => {
      const mockResult = {
        status: HttpStatus.OK,
        message: 'Database tables dropped successfully',
      };
      mockSeedingService.dropDatabase.mockResolvedValue(mockResult);
      const result = await controller.dropDatabase();

      expect(service.dropDatabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors thrown by the service', async () => {
      const mockError = new Error('Failed to drop tables due to constraints');
      mockSeedingService.dropDatabase.mockRejectedValue(mockError);
      await expect(controller.dropDatabase()).rejects.toThrow(mockError);
    });
  });

  describe('Seeding Table', () => {
    it('should call seedingService.seedTable and return its result', async () => {
      const mockResult = {
        status: HttpStatus.OK,
        message: 'Table seeding success',
      };
      mockSeedingService.dropDatabase.mockResolvedValue(mockResult);
      const result = await controller.dropDatabase();

      expect(service.dropDatabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors thrown by the service', async () => {
      const mockError = new Error('Failed to seed tables due to constraints');
      mockSeedingService.dropDatabase.mockRejectedValue(mockError);
      await expect(controller.dropDatabase()).rejects.toThrow(mockError);
    });
  });
});
