import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, userId: bigint) {
    return this.prisma.providerProfile.findUnique({
      where: { userId }, // Ensure userId is correctly passed here
    }).then(providerProfile => {
      if (!providerProfile) {
        throw new NotFoundException("Provider profile not found for this user");
      }
  
      const startTime = new Date(`2025-04-15T${dto.startTime}`);
      const endTime = new Date(`2025-04-15T${dto.endTime}`);
  
      // Check if the times are valid
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Invalid start time or end time");
      }
  
      return this.prisma.appointment.create({
        data: {
          userId,
          providerId: providerProfile.id,
          serviceId: dto.serviceId,
          appointmentDate: new Date(dto.appointmentDate),
          startTime: startTime,
          endTime: endTime,
          notes: dto.notes,
        },
      });
    });
  }
  

  findAll(userId: bigint, role: Role) {
    if (role === Role.ADMIN) {
      return this.prisma.appointment.findMany({
        include: {
          user: true,
          service: true,
          providerProfile: true,
        },
      });
    } else if (role === Role.PROVIDER) {
      return this.prisma.appointment.findMany({
        where: {
          providerId: userId, // assuming userId in PROVIDER refers to providerProfile.id
        },
        include: {
          user: true,
          service: true,
        },
      });
    } else {
      return this.prisma.appointment.findMany({
        where: {
          userId,
        },
        include: {
          service: true,
          providerProfile: true,
        },
      });
    }
  }

  async findOne(id: bigint) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        providerProfile: true,
      },
    });
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  update(id: bigint, dto: UpdateAppointmentDto) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: dto.appointmentDate ? new Date(dto.appointmentDate) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  delete(id: bigint) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
