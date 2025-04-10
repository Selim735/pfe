import { IsOptional, IsNumber } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsNumber()
  serviceId?: number;
}
