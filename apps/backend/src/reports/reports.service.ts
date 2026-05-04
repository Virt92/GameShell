import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(clubId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeSessions, todayRevenue, hosts, onlinePlayers] = await Promise.all([
      this.prisma.session.count({ where: { clubId, status: 'active' } }),
      this.prisma.session.aggregate({
        where: { clubId, status: 'completed', startedAt: { gte: today } },
        _sum: { amount: true },
      }),
      this.prisma.host.groupBy({
        by: ['status'],
        where: { clubId },
        _count: true,
      }),
      this.prisma.session.count({
        where: { clubId, status: 'active', playerId: { not: null } },
      }),
    ]);

    return {
      activeSessions,
      todayRevenue: todayRevenue._sum.amount || 0,
      hosts: hosts.reduce((acc, h) => ({ ...acc, [h.status]: h._count }), {}),
      onlinePlayers,
    };
  }

  async getRevenueReport(clubId: string, from: string, to: string, groupBy: 'day' | 'hour') {
    const sessions = await this.prisma.session.findMany({
      where: {
        clubId,
        status: 'completed',
        startedAt: { gte: new Date(from) },
        endedAt: { lte: new Date(to) },
      },
      select: { startedAt: true, amount: true, paymentMethod: true },
    });

    // Group by date/hour
    const grouped = new Map<string, { total: number; count: number }>();
    for (const s of sessions) {
      const key = groupBy === 'day'
        ? s.startedAt.toISOString().split('T')[0]
        : `${s.startedAt.toISOString().split('T')[0]}T${String(s.startedAt.getHours()).padStart(2, '0')}`;

      const existing = grouped.get(key) || { total: 0, count: 0 };
      existing.total += Number(s.amount || 0);
      existing.count++;
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      ...data,
    }));
  }

  async getOccupancyReport(clubId: string, from: string, to: string) {
    const hosts = await this.prisma.host.findMany({ where: { clubId } });
    const sessions = await this.prisma.session.findMany({
      where: {
        clubId,
        status: 'completed',
        startedAt: { gte: new Date(from) },
        endedAt: { lte: new Date(to) },
      },
      select: { hostId: true, actualMin: true },
    });

    const totalMinutes = (new Date(to).getTime() - new Date(from).getTime()) / 60000;

    return hosts.map(host => {
      const hostSessions = sessions.filter(s => s.hostId === host.id);
      const busyMinutes = hostSessions.reduce((sum, s) => sum + (s.actualMin || 0), 0);

      return {
        hostId: host.id,
        hostName: host.name,
        hostType: host.type,
        totalSessions: hostSessions.length,
        busyMinutes,
        occupancy: totalMinutes > 0 ? Math.round((busyMinutes / totalMinutes) * 100) : 0,
      };
    });
  }
}
