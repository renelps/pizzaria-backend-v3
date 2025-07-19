import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data.email, data.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login and get access token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() data: LoginDto) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Access token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refresh_token') refresh_token: string) {
    return this.authService.refresh(refresh_token);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Body('userId') userId: number) {
    return this.authService.logout(userId);
  }
}
