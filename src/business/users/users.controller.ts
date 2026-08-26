import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@Roles('ADMIN', 'OWNER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: any) {
    if (dto.role === 'ADMIN') {
      throw new ForbiddenException(
        'No se puede crear un usuario con el rol ADMIN',
      );
    }
    if (dto.role === 'OWNER' && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo un usuario ADMIN puede crear usuarios OWNER',
      );
    }
    return this.users.create(dto);
  }

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Patch(':id/change-password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(id, dto.newPassword);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}
