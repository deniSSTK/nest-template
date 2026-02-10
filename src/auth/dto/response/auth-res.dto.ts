import { TokensResDto } from './tokens-res.dto';
import { AuthenticatedUser } from '../auth-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResDto {
  @ApiProperty({ type: TokensResDto })
  tokens: TokensResDto;

  @ApiProperty({ type: AuthenticatedUser })
  user: AuthenticatedUser;
}
