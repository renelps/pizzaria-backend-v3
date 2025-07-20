import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  const mockReviewsService = {
    findAllByPizza: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);

    jest.clearAllMocks();
  });

  describe('findAllByPizza', () => {
    it('should return all reviews for a pizza', async () => {
      const pizzaId = 1;
      const result = [{ id: 1, comment: 'Ótima pizza!' }];
      mockReviewsService.findAllByPizza.mockResolvedValue(result);

      expect(await controller.findAllByPizza(pizzaId)).toEqual(result);
      expect(mockReviewsService.findAllByPizza).toHaveBeenCalledWith(pizzaId);
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewId = 1;
      const result = { id: 1, comment: 'Muito boa!' };
      mockReviewsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(reviewId)).toEqual(result);
      expect(mockReviewsService.findOne).toHaveBeenCalledWith(reviewId);
    });
  });

  describe('create', () => {
    it('should create a review', async () => {
      const userId = 42;
      const dto = { rating: 5, comment: 'Excelente!', pizzaId: 1 };
      const result = { id: 1, ...dto, userId };
      mockReviewsService.create.mockResolvedValue(result);

      const req = { user: { userId } };

      expect(await controller.create(req, dto)).toEqual(result);
      expect(mockReviewsService.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const userId = 42;
      const reviewId = 1;
      const dto = { rating: 4, comment: 'Bom!' };
      const result = { id: reviewId, ...dto };
      mockReviewsService.update.mockResolvedValue(result);

      const req = { user: { userId } };

      expect(await controller.update(req, reviewId, dto)).toEqual(result);
      expect(mockReviewsService.update).toHaveBeenCalledWith(userId, reviewId, dto);
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      const userId = 42;
      const reviewId = 1;
      const role = 'user';
      const result = { deleted: true };
      mockReviewsService.remove.mockResolvedValue(result);

      const req = { user: { userId, role } };

      expect(await controller.remove(req, reviewId)).toEqual(result);
      expect(mockReviewsService.remove).toHaveBeenCalledWith(userId, reviewId, role);
    });
  });
});
