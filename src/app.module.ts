import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { PizzaModule } from './pizza/pizza.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    PizzaModule,
    AuthModule,
  ],
})
export class AppModule {}
