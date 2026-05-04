import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginStaff(email: string, password: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { email, isActive: true },
      include: { club: true },
    });

    if (!staff) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const payload = {
      sub: staff.id,
      clubId: staff.clubId,
      role: staff.role,
      type: 'staff',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        clubId: staff.clubId,
        clubName: staff.club.name,
      },
    };
  }

  async sendPlayerSms(phone: string, clubId: string) {
    // TODO: integrate with real SMS provider (e.g. Twilio, TurboSMS)
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store code in Redis with TTL (for now, use a simple approach)
    // In production: store in Redis with 5-min TTL
    console.log(`SMS code for ${phone}: ${code}`);

    return { message: 'SMS код відправлено', phone };
  }

  async verifyPlayerSms(phone: string, code: string, clubId: string) {
    // TODO: verify code from Redis
    // For development, accept code "1234"
    if (code !== '1234') {
      throw new UnauthorizedException('Невірний код');
    }

    let player = await this.prisma.player.findFirst({
      where: { phone, clubId },
    });

    if (!player) {
      player = await this.prisma.player.create({
        data: { phone, clubId },
      });
    }

    const payload = {
      sub: player.id,
      clubId,
      type: 'player',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      player: {
        id: player.id,
        phone: player.phone,
        nickname: player.nickname,
        balance: player.balance,
        bonusPoints: player.bonusPoints,
        loyaltyLevel: player.loyaltyLevel,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload = {
        sub: payload.sub,
        clubId: payload.clubId,
        role: payload.role,
        type: payload.type,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, {
          expiresIn: payload.type === 'player' ? '30d' : '7d',
        }),
      };
    } catch {
      throw new UnauthorizedException('Невалідний токен');
    }
  }
}
