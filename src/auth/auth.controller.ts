import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountReqDto } from './dto/request/account-req.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResDto } from './dto/response/auth-res.dto';
import { AuthUser } from './decorators/auth-user.decorator';
import { AuthenticatedUser } from './dto/auth-user.dto';
import { TokenGuard } from './token/token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiOkResponse({ type: AuthenticatedUser })
  @UseGuards(TokenGuard)
  getMe(@AuthUser() actor: AuthenticatedUser) {
    return actor;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns access and refresh tokens',
  })
  @ApiCreatedResponse({
    type: AuthResDto,
    description: 'User successfully registered',
  })
  async register(@Body() dto: AccountReqDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthResDto,
    description: 'User successfully logged in',
  })
  @ApiOperation({ summary: 'Login for a user' })
  async login(@Body() dto: AccountReqDto) {
    return this.authService.login(dto);
  }
}
