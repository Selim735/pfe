import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';
import { ProviderProfileModule } from './provider-profile/provider-profile.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [AuthModule, ProviderProfileModule, PrismaModule, CategoryModule, ServiceModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, MailService],
})
export class AppModule {}
