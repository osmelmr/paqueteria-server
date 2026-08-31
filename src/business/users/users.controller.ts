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
  findAll(@Req() req: any) {
    return this.users.findAll(req.user?.role, req.user?.username);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.users.findOne(id, req.user?.role, req.user?.username);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    return this.users.update(id, req.user?.role, req.user?.username, dto);
  }

  @Patch(':id/change-password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.users.changePassword(
      id,
      req.user?.role,
      req.user?.username,
      dto.newPassword,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.users.remove(id, req.user?.role, req.user?.username);
  }
}
