import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateProviderProfileDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsUrl()
  businessLogoUrl?: string;

  @IsOptional()
  @IsString()
  businessLicenseNumber?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsLatitude()
  businessLatitude?: number;

  @IsOptional()
  @IsLongitude()
  businessLongitude?: number;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsUrl()
  businessWebsite?: string;

  // 🔒 userId is not accepted from the client. It is extracted from JWT on the server side.
}
