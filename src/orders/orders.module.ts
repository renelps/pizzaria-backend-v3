import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, OrdersGateway],
})
export class OrderModule {}