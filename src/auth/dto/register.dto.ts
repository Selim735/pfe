// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsEnum, Length, Matches, IsPhoneNumber } from 'class-validator';

export enum Role {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  readonly email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @Length(8, 100, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
  })
  readonly password: string;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @Length(2, 50, { message: 'Le prénom doit contenir entre 2 et 50 caractères' })
  readonly firstName: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @Length(2, 50, { message: 'Le nom doit contenir entre 2 et 50 caractères' })
  readonly lastName: string;

  @IsPhoneNumber(undefined, { message: 'Veuillez fournir un numéro de téléphone valide' })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire' })
  readonly phone: string;

  @IsEnum(Role, { message: 'Le rôle doit être USER, PROVIDER ou ADMIN' })
  readonly role: Role;
}