import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create new conversation
  async createConversation(dto: CreateConversationDto, sub: any) {
    return this.prisma.chatConversation.create({
      data: {
        userId: dto.userId,
        providerId: dto.providerId,
        serviceId: dto.serviceId,
      },
    });
  }

  // 📃 Get all conversations
  async getAllConversations(sub: any) {
    return this.prisma.chatConversation.findMany({
      include: {
        messages: true,
        service: true,
        provider: true,
        user: true,
      },
    });
  }

  // 🔍 Get one conversation
  async getConversation(id: number, sub: any) {
    const conv = await this.prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: true,
        service: true,
        provider: true,
        user: true,
      },
    });

    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  // ✏️ Update conversation (usually serviceId)
  async updateConversation(id: number, dto: UpdateConversationDto, sub: any) {
    return this.prisma.chatConversation.update({
      where: { id },
      data: {
        serviceId: dto.serviceId,
      },
    });
  }

  // 🗑 Delete conversation
  async deleteConversation(id: number, sub: any) {
    await this.prisma.chatConversation.delete({ where: { id } });
  }

  // ✉️ Create message
  async createMessage(dto: CreateMessageDto, sub: any) {
    return this.prisma.chatMessage.create({
      data: {
        conversationId: dto.conversationId,
        senderId: dto.senderId,
        messageText: dto.messageText,
        isRead: dto.isRead ?? false,
      },
    });
  }

  // 📬 Get messages by conversation
  async getMessagesByConversation(conversationId: number, sub: any) {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 🛠 Update message
  async updateMessage(id: number, dto: UpdateMessageDto, sub: any) {
    return this.prisma.chatMessage.update({
      where: { id },
      data: {
        messageText: dto.messageText,
        isRead: dto.isRead,
      },
    });
  }

  // ❌ Delete message
  async deleteMessage(id: number, sub: any) {
    await this.prisma.chatMessage.delete({ where: { id } });
  }
}
