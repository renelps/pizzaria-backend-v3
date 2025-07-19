import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockMovementDto {
  @ApiProperty({ description: 'ID of the pizza related to the stock movement' })
  @IsInt()
  pizzaId!: number;

  @ApiProperty({ description: 'Quantity added or removed from stock' })
  @IsInt()
  quantity!: number;

  @ApiPropertyOptional({ description: 'Reason or note for the stock movement' })
  @IsOptional()
  @IsString()
  reason?: string;
}
