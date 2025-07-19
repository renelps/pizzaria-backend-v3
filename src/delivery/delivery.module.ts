import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [DeliveryService, PrismaService],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}
