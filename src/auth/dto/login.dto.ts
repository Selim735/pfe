// src/auth/dto/login.dto.ts
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  @MaxLength(255, { message: 'L\'email ne peut pas dépasser 255 caractères' })
  readonly email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @Length(8, 100, { 
    message: 'Le mot de passe doit contenir entre 8 et 100 caractères' 
  })
  readonly password: string;

  // Optional remember me flag
  @IsOptional()
  @IsBoolean()
  readonly rememberMe?: boolean;
}
