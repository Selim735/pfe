import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  priceUnit?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  categoryId: number;
}
