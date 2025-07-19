import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';

@Module({
  controllers: [StockMovementsController],
  providers: [StockMovementsService, PrismaService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
