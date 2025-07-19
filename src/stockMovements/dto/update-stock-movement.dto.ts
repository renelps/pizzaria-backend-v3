import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStockMovementDto {
  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
