import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './interfaces/user.interface';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { registerBody, loginBody } from './constant/api.example';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiBody(registerBody)
  async register(@Body() credentials: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(credentials);
  }

  @Post('/login')
  @ApiBody(loginBody)
  async login(@Body() credentials: LoginDto): Promise<AuthResponse> {
    return this.authService.login(credentials);
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
