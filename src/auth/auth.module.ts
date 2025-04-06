// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';  // Import ConfigModule and ConfigService
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),  // Add ConfigModule to load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensure ConfigModule is available
      inject: [ConfigService], // Inject ConfigService to get JWT_SECRET
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get JWT_SECRET from env
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, JwtGuard, RolesGuard, MailService],
  exports: [JwtGuard, RolesGuard],
})
export class AuthModule {}
