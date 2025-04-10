import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceImageDto {
  @IsNotEmpty()
  serviceId: number;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
