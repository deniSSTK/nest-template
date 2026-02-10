import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TimeService } from '../../utils/time/time.service';

type ConfigValueType = 'string' | 'number' | 'duration';

interface ConfigKey {
  key: keyof Config;
  type: ConfigValueType;
  // default?: string | number;
}

interface Config {
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_APP_KEY: string;
  ACCESS_TOKEN_EXPIRED: number;
  REFRESH_TOKEN_EXPIRED: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: Config;

  constructor(private readonly timeService: TimeService) {
    const keys: ConfigKey[] = [
      { key: 'DATABASE_URL', type: 'string' },
      { key: 'REDIS_URL', type: 'string' },
      { key: 'REDIS_APP_KEY', type: 'string' },
      { key: 'ACCESS_TOKEN_EXPIRED', type: 'duration' },
      { key: 'REFRESH_TOKEN_EXPIRED', type: 'duration' },
      { key: 'JWT_ACCESS_SECRET', type: 'string' },
      { key: 'JWT_REFRESH_SECRET', type: 'string' },
    ];

    const config = {} as Record<keyof Config, string | number>;

    for (const { key, type } of keys) {
      const value = process.env[key];
      if (!value) {
        throw new InternalServerErrorException(`Config error: missing ${key}`);
      }
      config[key] = this.parseValue(value, type);
    }

    this.envConfig = config as Config;
  }

  private parseValue(value: string, type: ConfigValueType): string | number {
    switch (type) {
      case 'string':
        return value;
      case 'number':
        return Number(value);
      case 'duration':
        return this.timeService.parseDuration(value);
      default:
        throw new InternalServerErrorException(
          `Invalid config type: ${type as string}`,
        );
    }
  }

  get<T extends keyof Config>(key: T): Config[T] {
    return this.envConfig[key];
  }
}
