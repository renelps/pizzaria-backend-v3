import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'USER',
    refreshToken: 'validRefreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password if valid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', '123456');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        refreshToken: mockUser.refreshToken,
      });
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('notfound@example.com', '123456');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate access and refresh tokens and update user', async () => {
      (jwtService.sign as jest.Mock).mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      (prisma.user.update as jest.Mock).mockResolvedValue(true);

      const tokens = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: 'refreshToken' },
      });
      expect(tokens).toEqual({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      });
    });
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
        password: 'hashedPassword',
      });

      const result = await service.register('newuser@example.com', '123456');

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'hashedPassword',
        },
      });
      expect(result).toEqual({
        id: 1,
        email: 'newuser@example.com',
      });
    });
  });

  describe('refresh', () => {
    it('should return new tokens if refresh token is valid', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: mockUser.id });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(service, 'login').mockResolvedValue({
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken',
      });

      const tokens = await service.refresh('validRefreshToken');
      expect(jwtService.verify).toHaveBeenCalledWith('validRefreshToken', {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(tokens).toEqual({
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if user not found or token invalid', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 999 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh('invalidToken')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on verify error', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh('badToken')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(true);

      await service.logout(mockUser.id);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: null },
      });
    });
  });
});
