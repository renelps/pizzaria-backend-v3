import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStockMovementDto) {
    const pizza = await this.prisma.pizza.findUnique({ where: { id: data.pizzaId } });
    if (!pizza) throw new NotFoundException('Pizza not found');

    const newStock = pizza.stock + data.quantity;

    await this.prisma.pizza.update({
      where: { id: data.pizzaId },
      data: { stock: newStock },
    });
    return this.prisma.stockMovement.create({
      data: {
        pizzaId: data.pizzaId,
        quantity: data.quantity,
        reason: data.reason,
      },
    });
  }

  async findAllByPizza(pizzaId: number) {
    return this.prisma.stockMovement.findMany({
      where: { pizzaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
