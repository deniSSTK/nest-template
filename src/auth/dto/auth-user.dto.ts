import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUser {
  @ApiProperty({
    example: 'c7cc1cf1-6d13-4061-b01a-53a6acd8c5b9',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: UserRole.USER,
    description: 'User role in the system',
    enum: UserRole,
  })
  role: UserRole;
}
