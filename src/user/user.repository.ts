import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.userDevices.create({
      data: {
        id: deviceId,
        userId,
      },
    });
  }
}
