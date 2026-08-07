import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

const ACCESS_EXPIRES = (process.env.ACCESS_TOKEN_EXPIRES ??
  '2h') as JwtSignOptions['expiresIn'];
const REFRESH_EXPIRES_MS = parseDuration(process.env.JWT_EXPIRES_IN ?? '7d');
const REFRESH_BYTES = 48;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcryptCompare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(raw: string) {
    const hash = sha256(raw);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hash },
    });
    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();

    await this.prisma.refreshToken.deleteMany({ where: { id: stored.id } });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  }

  async logout(raw: string) {
    const hash = sha256(raw);
    await this.prisma.refreshToken.deleteMany({ where: { token: hash } });
  }

  private generateAccessToken(sub: string, role: string) {
    return this.jwt.sign({ sub, role }, { expiresIn: ACCESS_EXPIRES });
  }

  private async generateRefreshToken(userId: string) {
    const raw = crypto.randomBytes(REFRESH_BYTES).toString('hex');
    const hash = sha256(raw);
    await this.prisma.refreshToken.create({
      data: {
        token: hash,
        userId,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
      },
    });
    return raw;
  }
}

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function parseDuration(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}

async function bcryptCompare(data: string, hash: string) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(data, hash);
}
