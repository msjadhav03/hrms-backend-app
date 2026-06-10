import { Test, TestingModule } from '@nestjs/testing';
import { SeedingController } from '../seeding.controller'; // Adjust path as needed
import { SeedingService } from '../seeding.service'; // Adjust path as needed
import { HttpStatus } from '@nestjs/common';

describe('SeedingController', () => {
  let controller: SeedingController;
  let service: SeedingService;

  // Create a mock definition for the SeedingService
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
      // Arrange
      const mockResult = {
        status: HttpStatus.OK,
        message: 'Table creation success',
      };
      mockSeedingService.createDatabase.mockResolvedValue(mockResult);

      // Act
      const result = await controller.createDatabase();

      // Assert
      expect(service.createDatabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors thrown by the service', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockSeedingService.createDatabase.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.createDatabase()).rejects.toThrow(mockError);
    });
  });

  describe('dropDatabase', () => {
    it('should call seedingService.dropDatabase and return its result', async () => {
      // Arrange
      const mockResult = {
        status: HttpStatus.OK,
        message: 'Database tables dropped successfully',
      };
      mockSeedingService.dropDatabase.mockResolvedValue(mockResult);

      // Act
      const result = await controller.dropDatabase();

      // Assert
      expect(service.dropDatabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors thrown by the service', async () => {
      // Arrange
      const mockError = new Error('Failed to drop tables due to constraints');
      mockSeedingService.dropDatabase.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.dropDatabase()).rejects.toThrow(mockError);
    });
  });
});
