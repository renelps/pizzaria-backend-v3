import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';

export class CreateDeliveryDto {
  @ApiProperty({ example: 1, description: 'ID of the order to deliver' })
  @IsInt()
  orderId!: number;

  @ApiProperty({ example: 1, description: 'ID of the delivery address' })
  @IsInt()
  addressId!: number;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.PENDING, description: 'Delivery status' })
  @IsEnum(DeliveryStatus)
  status!: DeliveryStatus;

  @ApiPropertyOptional({ example: '2025-07-21T10:00:00Z', description: 'Estimated delivery date/time' })
  @IsDateString()
  @IsOptional()
  estimatedAt?: string;

  @ApiPropertyOptional({ example: '2025-07-21T12:00:00Z', description: 'Actual delivery date/time' })
  @IsDateString()
  @IsOptional()
  deliveredAt?: string;
}
