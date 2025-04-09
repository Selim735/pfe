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

@UseGuards(JwtGuard, RolesGuard) // <-- أضف RolesGuard لتتمكن من استخدام @Roles في أي route
@Controller('provider-profile')
export class ProviderProfileController {
  constructor(private readonly providerProfileService: ProviderProfileService) {}

  @Post()
  @Roles('PROVIDER','ADMIN') // فقط مزودي الخدمة يستطيعون إنشاء ملف
  async create(@Body() dto: CreateProviderProfileDto, @Req() req) {
    const userId = req.user?.sub;
    return this.providerProfileService.create(BigInt(userId), dto);
  }

  @Get()
  @Roles('PROVIDER', 'ADMIN')
  async getProfile(@Req() req) {
    const userId = req.user?.sub;
    return this.providerProfileService.findByUserId(BigInt(userId));
  }

  @Put()
  @Roles('PROVIDER', 'ADMIN')
  async update(@Body() dto: UpdateProviderProfileDto, @Req() req) {
    const userId = req.user?.sub;
    return this.providerProfileService.update(BigInt(userId), dto);
  }

  @Delete(':targetUserId')
  @Roles('PROVIDER', 'ADMIN')
  async delete(@Param('targetUserId', ParseIntPipe) targetUserId: number, @Req() req) {
    const userId = req.user?.sub;
    return this.providerProfileService.delete(BigInt(userId), BigInt(targetUserId));
  }

  @Put('admin/:targetUserId')
  @Roles('ADMIN')
  async adminUpdate(
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Body() dto: UpdateProviderProfileDto,
    @Req() req
  ) {
    const adminId = req.user?.sub;
    return this.providerProfileService.adminUpdate(BigInt(adminId), BigInt(targetUserId), dto);
  }
}
