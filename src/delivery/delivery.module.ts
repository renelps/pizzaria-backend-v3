import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../shared/geo.service';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, PrismaService, GeoService],
})
export class DeliveryModule {}