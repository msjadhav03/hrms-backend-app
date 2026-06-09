import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { DatabaseProviders } from './database.service';
import { Pool } from 'pg';

jest.mock('pg', () => {
  const mockClient = {
    release: jest.fn(),
  };
  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('DatabaseProviders', () => {
  let pool: Pool;
  let mockConfigService: Partial<ConfigService>;
  let mockPoolInstance: any;

  beforeEach(async () => {
    mockPoolInstance = new Pool();
    (Pool as unknown as jest.Mock).mockClear();
    mockPoolInstance.connect.mockClear();

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'test_user',
          POSTGRES_PASSWORD: 'test_password',
          POSTGRES_DB: 'test_db',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...DatabaseProviders,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    pool = module.get<Pool>('PG_CONNECTION');
  });

  it('should be defined', () => {
    expect(pool).toBeDefined();
  });

  it('should successfully establish a connection and return the pool instance', async () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('POSTGRES_HOST');
    expect(mockConfigService.get).toHaveBeenCalledWith('POSTGRES_PORT');
    expect(mockPoolInstance.connect).toHaveBeenCalledTimes(1);
    expect(pool).toBe(mockPoolInstance);
  });

  it('should throw an InternalServerErrorException if connection fails', async () => {
    mockPoolInstance.connect.mockRejectedValueOnce(
      new Error('Connection timed out'),
    );
    const failModuleBuilder = Test.createTestingModule({
      providers: [
        ...DatabaseProviders,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    });
    await expect(failModuleBuilder.compile()).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
