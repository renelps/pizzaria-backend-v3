import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
      validateUser: jest.fn(),
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
      refresh: jest.fn().mockResolvedValue({ access_token: 'new-token' }),
      logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const dto: CreateUserDto = { email: 'test@example.com', password: '123456' };
    const result = await controller.register(dto);
    expect(result).toEqual({ id: 1, email: 'test@example.com' });
    expect(mockAuthService.register).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('should login a user with valid credentials', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: '123456' };
    (mockAuthService.validateUser as jest.Mock).mockResolvedValue({ id: 1, email: dto.email });
    const result = await controller.login(dto);
    expect(result).toEqual({ access_token: 'token' });
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('should throw UnauthorizedException on invalid login', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'wrong' };
    (mockAuthService.validateUser as jest.Mock).mockResolvedValue(null);

    await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should refresh token', async () => {
    const token = 'refresh-token';
    const result = await controller.refresh(token);
    expect(result).toEqual({ access_token: 'new-token' });
    expect(mockAuthService.refresh).toHaveBeenCalledWith(token);
  });

  it('should logout user', async () => {
    const userId = 1;
    const result = await controller.logout(userId);
    expect(result).toEqual({ message: 'Logged out' });
    expect(mockAuthService.logout).toHaveBeenCalledWith(userId);
  });
});
