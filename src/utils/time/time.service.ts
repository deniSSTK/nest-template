import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class TimeService {
  parseDuration(duration: string): number {
    const matches = duration.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!matches) {
      throw new BadRequestException(
        `Invalid duration format: "${duration}". Expected format: 5m, 30s, 1h, etc.`,
      );
    }

    const value = parseInt(matches[1], 10);
    const unit = matches[2];

    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
