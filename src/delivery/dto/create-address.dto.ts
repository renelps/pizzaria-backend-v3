import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Street name' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: '456', description: 'House or apartment number' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({ example: 'New York', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'NY', description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '10001', description: 'Postal/Zip code' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Country name, defaults to Brasil' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
