import { Controller, Post, Body, Req, UseGuards, Get, BadRequestException, Delete, Put } from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Param, ParseIntPipe } from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('provider-profile')
export class ProviderProfileController {
  constructor(private readonly providerProfileService: ProviderProfileService) { }

  @Post()
  async create(@Body() dto: CreateProviderProfileDto, @Req() req) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated properly');
    }

    return this.providerProfileService.create(BigInt(userId), dto);
  }

  @Get()
  async getProfile(@Req() req) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated properly');
    }

    return this.providerProfileService.findByUserId(BigInt(userId));
  }

  @Put()
  async update(@Body() dto: CreateProviderProfileDto, @Req() req) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('User not authenticated properly');

    return this.providerProfileService.update(BigInt(userId), dto);
  }

  @Delete(':targetUserId')
  async delete(
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Req() req
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('User not authenticated properly');

    return this.providerProfileService.delete(BigInt(userId), BigInt(targetUserId));
  }

}

