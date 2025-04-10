import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ServiceImageService } from './service-image.service';
import { CreateServiceImageDto } from './dto/create-service-image.dto';
import { UpdateServiceImageDto } from './dto/update-service-image.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/role.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('service-images')
@UseGuards(JwtGuard, RolesGuard)
export class ServiceImageController {
    private readonly logger = new Logger(ServiceImageController.name);

    constructor(private readonly serviceImageService: ServiceImageService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PROVIDER)
    create(@Request() req, @Body() dto: CreateServiceImageDto) {
        try {
            if (!dto.serviceId) {
                throw new BadRequestException('serviceId is required');
            }

            // Log the incoming data
            this.logger.log(`Creating service image with serviceId: ${dto.serviceId}, userId: ${req?.user?.sub}`);

            // Make sure req.user exists and has a sub
            if (!req.user || !req.user.sub) {
                throw new BadRequestException('User information is missing');
            }

            const userId = BigInt(req.user.sub);
            const role = req.user.role;

            return this.serviceImageService.create(userId, role, dto);
        } catch (error) {
            this.logger.error(`Error creating service image: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to create service image: ${error.message}`);
        }
    }

    @Get()
    @Roles(Role.ADMIN, Role.PROVIDER)
    findAll() {
        return this.serviceImageService.findAll();
    }

    @Get(':id')
    findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            if (!req.user || !req.user.sub) {
                throw new BadRequestException('User information is missing');
            }

            const userId = BigInt(req.user.sub);
            const role = req.user.role;
            return this.serviceImageService.findOne(BigInt(id));
        } catch (error) {
            this.logger.error(`Error finding service image: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to find service image: ${error.message}`);
        }
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    update(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateServiceImageDto,
    ) {
        try {
            if (!req.user || !req.user.sub) {
                throw new BadRequestException('User information is missing');
            }

            const userId = BigInt(req.user.sub);
            const role = req.user.role;
            return this.serviceImageService.update(userId, role, BigInt(id), dto);
        } catch (error) {
            this.logger.error(`Error updating service image: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to update service image: ${error.message}`);
        }
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.PROVIDER)
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            if (!req.user || !req.user.sub) {
                throw new BadRequestException('User information is missing');
            }

            const userId = BigInt(req.user.sub);
            const role = req.user.role;
            return this.serviceImageService.remove(userId, role, BigInt(id));
        } catch (error) {
            this.logger.error(`Error removing service image: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to remove service image: ${error.message}`);
        }
    }
}