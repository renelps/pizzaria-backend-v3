import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const prismaMock = {
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      const userId = 1;
      const dto = {
        pizzaId: 2,
        rating: 4,
        comment: 'Muito boa!',
      };

      (prisma.review.create as jest.Mock).mockResolvedValue({
        id: 10,
        userId,
        pizzaId: dto.pizzaId,
        rating: dto.rating,
        comment: dto.comment,
      });

      const result = await service.create(userId, dto);
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: userId } },
          pizza: { connect: { id: dto.pizzaId } },
          rating: dto.rating,
          comment: dto.comment,
        },
      });
      expect(result).toEqual(expect.objectContaining({ rating: 4, comment: 'Muito boa!' }));
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if review not found', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should return the review if found', async () => {
      const review = { id: 5, userId: 1, rating: 5, comment: 'Ótima pizza', pizza: {}, user: {} };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(review);
      const result = await service.findOne(5);
      expect(result).toBe(review);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if review not found', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.update(1, 99, { rating: 5 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId: 3 });
      await expect(service.update(1, 2, { rating: 4 })).rejects.toThrow(ForbiddenException);
    });

    it('should update and return the review if authorized', async () => {
      const updatedReview = { id: 2, userId: 1, rating: 4 };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId: 1 });
      (prisma.review.update as jest.Mock).mockResolvedValue(updatedReview);

      const result = await service.update(1, 2, { rating: 4 });
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { rating: 4 },
      });
      expect(result).toEqual(updatedReview);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if review not found', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(1, 99, 'USER')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not owner and not admin', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId: 3 });
      await expect(service.remove(1, 2, 'USER')).rejects.toThrow(ForbiddenException);
    });

    it('should allow deletion if user is owner', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId: 1 });
      (prisma.review.delete as jest.Mock).mockResolvedValue(true);

      const result = await service.remove(1, 2, 'USER');
      expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result).toBe(true);
    });

    it('should allow deletion if user is admin', async () => {
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId: 3 });
      (prisma.review.delete as jest.Mock).mockResolvedValue(true);

      const result = await service.remove(1, 2, 'ADMIN');
      expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result).toBe(true);
    });
  });
});
