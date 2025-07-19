import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { PizzaModule } from './pizza/pizza.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DeliveryModule } from './delivery/delivery.module';
import { StockMovementsModule } from './stockMovements/stock-movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    PizzaModule,
    AuthModule,
    OrderModule,
    ReviewsModule,
    DeliveryModule,
    StockMovementsModule,
  ],
})
export class AppModule {}
