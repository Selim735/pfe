import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtGuard } from '../auth/jwt.guard'; // Importing the JwtGuard
import { RolesGuard } from '../auth/roles.guard'; // Importing the RolesGuard
import { Roles } from '../auth/role.decorator'; // Importing the Roles decorator
import { Role } from '@prisma/client'; // Assuming you have a Role enum in Prisma
import { User } from '../user.decorator'; // Custom user decorator for extracting user info from JWT

@Controller('chat')
@UseGuards(JwtGuard, RolesGuard) // Protect all routes with JWT and Roles Guard
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // 📩 Create new conversation - Only accessible by USER or PROVIDER
    @Post('conversations')
    @Roles(Role.USER, Role.PROVIDER, Role.ADMIN) 
    @HttpCode(HttpStatus.CREATED)
    createConversation(@Body() dto: CreateConversationDto, @User() user) {
        // استخدم user.sub مباشرة
        return this.chatService.createConversation(dto, user.sub);
    }

    // 📬 Get all conversations - Only accessible by PROVIDER or ADMIN
    @Get('conversations')
    @Roles(Role.PROVIDER, Role.ADMIN) // Only PROVIDER or ADMIN can get conversations
    @HttpCode(HttpStatus.OK)
    getAllConversations(@User() user) {
        return this.chatService.getAllConversations(user.sub); 
    }
    

    // 📨 Get one conversation by id - Accessible by PROVIDER, USER, or ADMIN
    @Get('conversations/:id')
    @Roles(Role.PROVIDER, Role.USER, Role.ADMIN) // PROVIDER, USER, and ADMIN can access a specific conversation
    @HttpCode(HttpStatus.OK)
    getConversation(@Param('id', ParseIntPipe) id: number, @User() user) {
        return this.chatService.getConversation(id, user.sub); 
    }
    

    // 🛠️ Update conversation (only serviceId for now) - Accessible by PROVIDER or ADMIN
    @Patch('conversations/:id')
    @Roles(Role.PROVIDER, Role.ADMIN) // Only PROVIDER or ADMIN can update the conversation
    @HttpCode(HttpStatus.OK)
    updateConversation(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateConversationDto,
        @User() user
    ) {
        return this.chatService.updateConversation(id, dto, user.sub); 
    }
    

    // 🗑️ Delete conversation - Accessible by PROVIDER or ADMIN
    @Delete('conversations/:id')
    @Roles(Role.PROVIDER, Role.ADMIN) // Only PROVIDER or ADMIN can delete a conversation
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteConversation(@Param('id', ParseIntPipe) id: number, @User() user) {
        return this.chatService.deleteConversation(id, user.sub); 
    }
    

    // ✉️ Send new message - Only accessible by USER or PROVIDER
    @Post('messages')
    @Roles(Role.USER, Role.PROVIDER) // Only USER or PROVIDER can send messages
    @HttpCode(HttpStatus.CREATED)
    createMessage(@Body() dto: CreateMessageDto, @User() user) {
        return this.chatService.createMessage(dto, user.sub); 
    }
    

    // 📃 Get all messages of a conversation - Accessible by PROVIDER, USER
    @Get('messages/:conversationId')
    @Roles(Role.PROVIDER, Role.USER) // PROVIDER and USER can get the messages of a conversation
    @HttpCode(HttpStatus.OK)
    getMessages(@Param('conversationId', ParseIntPipe) conversationId: number, @User() user) {
        return this.chatService.getMessagesByConversation(conversationId, user.sub); 
    }
    

    // 🛠️ Update a message (text or isRead) - Accessible by PROVIDER or ADMIN
    @Patch('messages/:id')
    @Roles(Role.PROVIDER, Role.ADMIN) // Only PROVIDER or ADMIN can update a message
    @HttpCode(HttpStatus.OK)
    updateMessage(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMessageDto,
        @User() user
    ) {
        return this.chatService.updateMessage(id, dto, user.sub); 
    }
    

    // 🗑️ Delete a message - Accessible by PROVIDER or ADMIN
    @Delete('messages/:id')
    @Roles(Role.PROVIDER, Role.ADMIN) // Only PROVIDER or ADMIN can delete a message
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteMessage(@Param('id', ParseIntPipe) id: number, @User() user) {
        return this.chatService.deleteMessage(id, user.sub); 
    }
    
}
