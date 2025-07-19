import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPizzaDto {
  @ApiPropertyOptional({ description: 'Locale code to filter translations, e.g. en, pt' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: 'Search term to filter pizzas by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter', type: Number, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter', type: Number, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
