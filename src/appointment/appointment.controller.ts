import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { AppointmentService } from './appointment.service';
  import { CreateAppointmentDto } from './dto/create-appointment.dto';
  import { UpdateAppointmentDto } from './dto/update-appointment.dto';
  import { JwtGuard } from 'src/auth/jwt.guard';
  import { Roles } from 'src/auth/role.decorator';
  import { RolesGuard } from 'src/auth/roles.guard';
  import { Role } from '@prisma/client';
  
  @UseGuards(JwtGuard, RolesGuard)
  @Controller('appointments')
  export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}
  
    @Post()
    @Roles(Role.USER, Role.ADMIN, Role.PROVIDER)
    create(@Body() dto: CreateAppointmentDto, @Request() req) {
      const userId = BigInt(req.user.sub);
      return this.appointmentService.create(dto, userId);
    }
  
    @Get()
    @Roles(Role.ADMIN, Role.PROVIDER, Role.USER)
    findAll(@Request() req) {
      const userId = BigInt(req.user.sub);
      const role = req.user.role;
      return this.appointmentService.findAll(userId, role);
    }
  
    @Get(':id')
    @Roles(Role.ADMIN, Role.PROVIDER, Role.USER)
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.appointmentService.findOne(BigInt(id));
    }
  
    @Patch(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) {
      return this.appointmentService.update(BigInt(id), dto);
    }
  
    @Delete(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.appointmentService.delete(BigInt(id));
    }
  }
  