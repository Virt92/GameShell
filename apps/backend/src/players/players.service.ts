import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClub(clubId: string, search?: string) {
    const where: any = { clubId };
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.player.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { startedAt: 'desc' }, take: 10, include: { host: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!player) throw new NotFoundException('Гравця не знайдено');
    return player;
  }

  async topUp(id: string, amount: number) {
    return this.prisma.player.update({
      where: { id },
      data: { balance: { increment: amount } },
    });
  }

  async getStats(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Гравця не знайдено');

    const sessions = await this.prisma.session.aggregate({
      where: { playerId: id, status: 'completed' },
      _count: true,
      _sum: { actualMin: true, amount: true },
    });

    return {
      totalSessions: sessions._count,
      totalMinutes: sessions._sum.actualMin || 0,
      totalSpent: sessions._sum.amount || 0,
      balance: player.balance,
      bonusPoints: player.bonusPoints,
      loyaltyLevel: player.loyaltyLevel,
    };
  }
}
