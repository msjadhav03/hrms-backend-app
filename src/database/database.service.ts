import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

export const DatabaseProviders = [
  {
    provide: 'PG_CONNECTION',
    inject: [ConfigService],

    useFactory: async (configService: ConfigService) => {
      const host = configService.get<string>('POSTGRES_HOST');
      const port = parseInt(
        configService.get<string>('POSTGRES_PORT') || '5432',
        10,
      );
      const user = configService.get<string>('POSTGRES_USER');
      const password = configService.get<string>('POSTGRES_PASSWORD');
      const database = configService.get<string>('POSTGRES_DB');

      const pool = new Pool({
        host,
        port,
        user,
        password,
        database,
      });

      try {
        const client = await pool.connect();
        client.release();

        console.log('Successfully connected to the database');
      } catch (err) {
        throw new InternalServerErrorException(
          'Error connecting to the database',
        );
      }

      return pool;
    },
  },
];
