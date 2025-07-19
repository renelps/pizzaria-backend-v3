import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(data: CreateOrderDto): Promise<Order> {
    const { pizzas, userId, status, addressId } = data;

    const pizzaIds = pizzas.map(p => p.pizzaId);
    const pizzasFromDb = await this.prisma.pizza.findMany({
      where: { id: { in: pizzaIds } },
    });

    if (pizzasFromDb.length !== pizzaIds.length) {
      throw new NotFoundException('One or more pizzas not found');
    }

    const total = pizzas.reduce((sum, p) => {
      const pizza = pizzasFromDb.find(db => db.id === p.pizzaId);
      return pizza ? sum + pizza.price * p.quantity : sum;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        status: status || OrderStatus.PENDING,
        total,
        user: { connect: { id: userId } },
        orderPizzas: {
          create: pizzas.map(p => ({
            pizza: { connect: { id: p.pizzaId } },
            quantity: p.quantity,
          })),
        },
        delivery: addressId
          ? {
              create: {
                address: { connect: { id: addressId } },
                status: OrderStatus.PENDING,
              },
            }
          : undefined,
      },
      include: {
        orderPizzas: { include: { pizza: true } },
        delivery: true,
      },
    });

    this.ordersGateway.sendOrderStatusUpdate(order.id, order.status);
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        orderPizzas: { include: { pizza: true } },
        delivery: true,
        user: true,
      },
    });
  }

  async findOne(id: number, userId?: number): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderPizzas: { include: { pizza: true } },
        delivery: true,
        user: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderPizzas: { include: { pizza: true } },
        delivery: true,
        user: true,
      },
    });

    this.ordersGateway.sendOrderStatusUpdate(order.id, order.status);
    return order;
  }
}
