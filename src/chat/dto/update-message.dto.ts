import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  messageText?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
