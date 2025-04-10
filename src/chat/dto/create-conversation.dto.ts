import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  providerId: number;

  @IsNumber()
  @IsOptional()
  serviceId?: number;
}
