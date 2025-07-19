import { IsInt, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PizzaOrderDto {
  @ApiProperty({ description: 'ID of the pizza' })
  @IsInt()
  pizzaId!: number;

  @ApiProperty({ description: 'Quantity of this pizza' })
  @IsInt()
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID placing the order' })
  @IsInt()
  userId!: number;

  @ApiProperty({ type: [PizzaOrderDto], description: 'List of pizzas in the order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PizzaOrderDto)
  pizzas!: PizzaOrderDto[];

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Delivery address ID' })
  @IsOptional()
  @IsInt()
  addressId?: number;
}
