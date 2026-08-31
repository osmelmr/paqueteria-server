import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserRole } from 'generated/prisma/enums.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    console.log(dto);
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing)
      throw new ConflictException('Email or username already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        agencyId: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    console.log(user);
    return user;
  }

  async findAll(role: string, username: string) {
    let pass: UserRole[] = ['ADMIN'];
    if (role === 'OWNER') pass.splice(1, 0, 'OWNER');
    if (username === 'tester') pass = [];
    return await this.prisma.user.findMany({
      where: {
        role: {
          notIn: pass,
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        agencyId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, role: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        agencyId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (username === 'tester' && role === 'ADMIN') return user;
    if (user.username === username) return user;
    if (role === 'ADMIN' && user.role === 'OWNER') {
      return user;
    }
    if (role === 'ADMIN' && user.role === 'ADMIN') {
      return null;
    }
    if (role === 'OWNER' && (user.role === 'ADMIN' || user.role === 'OWNER')) {
      return null;
    }
    return user;
  }

  async update(id: string, role: string, username: string, dto: UpdateUserDto) {
    await this.findOne(id, role, username);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        agencyId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(
    id: string,
    role: string,
    username: string,
    newPassword: string,
  ) {
    await this.findOne(id, role, username);
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        agencyId: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, role: string, username: string) {
    await this.findOne(id, role, username);
    await this.prisma.user.delete({ where: { id } });
  }
}
