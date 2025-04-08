import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  BadRequestException,
  Delete,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/role.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtGuard)
@Controller('provider-profile')
export class ProviderProfileController {
  constructor(private readonly providerProfileService: ProviderProfileService) {}

  @Post()
  async create(@Body() dto: CreateProviderProfileDto, @Req() req) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('User not authenticated properly');

    return this.providerProfileService.create(BigInt(userId), dto);
  }

  @Get()
  async getProfile(@Req() req) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('User not authenticated properly');

    return this.providerProfileService.findByUserId(BigInt(userId));
  }

  @Put()
  async update(@Body() dto: UpdateProviderProfileDto, @Req() req) {
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

  // ✅ Route spéciale pour l'admin
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:targetUserId')
  async adminUpdate(
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Body() dto: UpdateProviderProfileDto,
    @Req() req
  ) {
    const adminId = req.user?.sub;
    if (!adminId) throw new BadRequestException('User not authenticated properly');

    return this.providerProfileService.adminUpdate(BigInt(adminId), BigInt(targetUserId), dto);
  }
}
