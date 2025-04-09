import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/role.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('PROVIDER', 'ADMIN')
  @Post()
  async create(@Req() req, @Body() dto: CreateServiceDto) {
    return this.serviceService.createService(BigInt(req.user.sub), req.user.role, dto);
  }

  @Get()
  getAll() {
    return this.serviceService.getAllServices();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.serviceService.getServiceById(BigInt(id));
  }

  @Roles('PROVIDER', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateServiceDto>) {
    return this.serviceService.updateService(BigInt(id), data);
  }

  @Roles('PROVIDER', 'ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.serviceService.deleteService(BigInt(id));
  }
}
