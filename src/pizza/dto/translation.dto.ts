import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslationDto {
  @ApiProperty({ description: 'Locale code, e.g. en, pt' })
  @IsString()
  locale!: string;

  @ApiProperty({ description: 'Translated name of the pizza' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Optional description in the given locale' })
  @IsOptional()
  @IsString()
  description?: string;
}
