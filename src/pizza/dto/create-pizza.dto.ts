import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslationDto {
  @ApiProperty({ description: 'Locale code, e.g. en, pt' })
  @IsString()
  locale!: string;

  @ApiProperty({ description: 'Translated pizza name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Translated pizza description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePizzaDto {
  @ApiProperty({ description: 'Unique slug for the pizza' })
  @IsString()
  slug!: string;

  @ApiProperty({ description: 'Price of the pizza' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'URL to pizza image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Available stock quantity' })
  @IsNumber()
  stock!: number;

  @ApiProperty({ type: [TranslationDto], description: 'Translations for the pizza' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations!: TranslationDto[];
}
