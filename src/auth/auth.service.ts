import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { Role } from '@prisma/client'; // Importer l'enum Role depuis Prisma

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  async register(dto: RegisterDto) {
    try {
      // Sanitize inputs
      const email = dto.email ? dto.email.toLowerCase().trim() : '';
      const firstName = dto.firstName ? dto.firstName.trim() : '';
      const lastName = dto.lastName ? dto.lastName.trim() : '';
      const phone = dto.phone ? dto.phone.trim() : '';

      // Validation supplémentaire (en plus de class-validator)
      if (!email || !firstName || !lastName || !phone || !dto.password) {
        throw new BadRequestException('Tous les champs sont obligatoires');
      }

      // Validation du format email avec regex
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Format d\'email invalide');
      }

      // Validation du format téléphone
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        throw new BadRequestException('Format de numéro de téléphone invalide');
      }

      // Check for existing user
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Using generic message for security
        throw new BadRequestException('Données d\'inscription invalides');
      }

      // Check for existing phone number
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone },
      });

      if (existingPhone) {
        throw new BadRequestException('Données d\'inscription invalides');
      }

      // Vérification de la complexité du mot de passe
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(dto.password)) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      }

      // Use stronger password hashing with higher cost factor
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      // Use more secure token generation
      const verificationToken = crypto.randomBytes(48).toString('hex');

      // Shorter expiration time
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role: this.validateRole(dto.role),
          verificationToken,
          verificationTokenExpiresAt: expiresAt,
        },
      });

      await this.mailService.sendVerificationEmail(email, verificationToken);

      // Don't log sensitive information
      return { message: 'Utilisateur créé. Veuillez vérifier votre email pour activer votre compte.' };

    } catch (error) {
      // Logging pour debugging (ne pas exposer dans la prod)
      console.error('Registration error:', error);

      // Si c'est déjà une BadRequestException, la renvoyer
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle errors appropriately without exposing details
      throw new BadRequestException('L\'inscription a échoué');
    }
  }

  // Helper method to validate roles - returns Role enum
  private validateRole(role?: string): Role {
    if (role === 'ADMIN') {
      return Role.ADMIN;
    }
    return Role.USER; // Default role
  }

  async login(dto: LoginDto) {
    // Implement rate limiting here (could use Redis)

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // Don't indicate if user exists or not
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify email before login
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Set appropriate token expiration and add more claims
    const token = this.jwtService.sign(
      {
        sub: user.id.toString(),
        role: user.role,
        email: user.email
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'), // ✅ بدل JWT_SECRET_KEY
        expiresIn: '1d', // Shorter expiration
      }
    );

    return { token };
  }

  async verifyEmail(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Invalid token format');
    }

    try {
      // Utiliser une transaction pour garantir l'atomicité
      return await this.prisma.$transaction(async (prisma) => {
        // Trouver l'utilisateur avec le token valide
        const user = await prisma.user.findFirst({
          where: {
            verificationToken: token,
            verificationTokenExpiresAt: { gte: new Date() },
          },
        });

        if (!user) {
          throw new BadRequestException('Invalid or expired verification token');
        }

        // Mettre à jour l'utilisateur
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
          },
        });

        return { message: 'Email successfully verified' };
      });
    } catch (error) {
      console.error('Email verification error:', error);

      // Si c'est déjà une BadRequestException, la renvoyer
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Verification failed');
    }
  }

  async sendResetPasswordToken(email: string) {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email format');
    }

    // Use the same response regardless if user exists or not
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return success anyway for security (don't reveal if email exists)
      return { message: 'If your email is registered, you will receive reset instructions' };
    }

    // Use secure token generation
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes (shorter time)

    await this.prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendResetPasswordEmail(email, token);

    return { message: 'If your email is registered, you will receive reset instructions' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      throw new BadRequestException('Invalid input format');
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: { gte: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    // Use stronger hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });

      return { message: 'Password successfully updated' };
    } catch (error) {
      throw new BadRequestException('Password reset failed');
    }
  }

  async forgotPassword(email: string) {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email format');
    }

    // Use the same response regardless if user exists or not
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return success anyway for security
      return { message: 'Si votre adresse email est enregistrée, vous recevrez un lien de réinitialisation' };
    }

    // Use secure random token
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes (shorter time)

    await this.prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendResetPasswordEmail(email, token);

    return { message: 'Si votre adresse email est enregistrée, vous recevrez un lien de réinitialisation' };
  }
}