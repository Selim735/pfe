// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }


    // Register a new user
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }


    // Login a user
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }


    // Forget password
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.sendResetPasswordToken(email);
    }

    // Reset password
    @Post('reset-password')
    async resetPassword(@Body() dto: { token: string; newPassword: string }) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    // Verify email
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }
}
