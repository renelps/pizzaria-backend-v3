import { Module } from '@nestjs/common';
import { PizzaService } from './pizzas.service';
import { PizzaController } from './pizzas.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PizzaController],
  providers: [PizzaService, PrismaService],
  exports: [PizzaService],
})
export class PizzaModule {}
