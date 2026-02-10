import { Injectable } from '@nestjs/common';

export interface ICachePipeline {
  set(key: string, value: string): this;
  setEx(key: string, seconds: number, value: string): this;
  del(key: string): this;

  zAdd(key: string, score: number, member: string): this;
  expire(key: string, seconds: number): this;

  exec(): Promise<any>;
}
@Injectable()
export abstract class CacheService {
  protected prefix: string = '';

  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract delPattern(pattern: string): Promise<void>;
  abstract pipeline(): ICachePipeline;

  protected buildKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }
}
