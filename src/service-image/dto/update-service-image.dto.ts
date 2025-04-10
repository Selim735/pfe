import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateServiceImageDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
