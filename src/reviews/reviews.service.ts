import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        user: { connect: { id: userId } },
        pizza: { connect: { id: data.pizzaId } },
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  async findAllByPizza(pizzaId: number) {
    return this.prisma.review.findMany({
      where: { pizzaId },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } }, pizza: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(userId: number, id: number, data: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Not authorized to update this review');

    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async remove(userId: number, id: number, userRole: 'ADMIN' | 'USER') {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('Not authorized to delete this review');

    return this.prisma.review.delete({ where: { id } });
  }
}
