import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateSessionDto, UpdateSessionDto } from './sessions.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async create(dto: CreateSessionDto, operatorId?: string) {
    // Check host is available
    const host = await this.prisma.host.findUnique({ where: { id: dto.hostId } });
    if (!host) throw new NotFoundException('Хост не знайдено');

    const activeSession = await this.prisma.session.findFirst({
      where: { hostId: dto.hostId, status: 'active' },
    });
    if (activeSession) throw new BadRequestException('На цьому хості вже є активна сесія');

    const session = await this.prisma.session.create({
      data: {
        clubId: dto.clubId,
        hostId: dto.hostId,
        playerId: dto.playerId,
        tariffId: dto.tariffId,
        operatorId,
        type: dto.type as any,
        durationMin: dto.durationMin,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod as any,
      },
      include: { host: true, player: true, tariff: true },
    });

    // Update host status
    await this.prisma.host.update({
      where: { id: dto.hostId },
      data: { status: 'busy' },
    });

    // Emit real-time updates
    this.ws.emitSessionUpdate(dto.clubId, {
      sessionId: session.id,
      status: 'active',
      hostId: dto.hostId,
      hostName: host.name,
      playerName: session.player?.nickname || 'Гість',
      durationMin: dto.durationMin,
      startedAt: session.startedAt,
    });

    this.ws.emitHostStatus(dto.clubId, {
      hostId: dto.hostId,
      status: 'busy',
    });

    return session;
  }

  async findActive(clubId: string) {
    return this.prisma.session.findMany({
      where: { clubId, status: { in: ['active', 'paused'] } },
      include: {
        host: true,
        player: true,
        tariff: true,
        operator: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findHistory(clubId: string, params: { from?: string; to?: string; hostId?: string; limit?: number }) {
    const where: any = { clubId, status: { in: ['completed', 'cancelled'] } };

    if (params.from) where.startedAt = { ...where.startedAt, gte: new Date(params.from) };
    if (params.to) where.endedAt = { ...where.endedAt, lte: new Date(params.to) };
    if (params.hostId) where.hostId = params.hostId;

    return this.prisma.session.findMany({
      where,
      include: {
        host: true,
        player: true,
        tariff: true,
      },
      orderBy: { startedAt: 'desc' },
      take: params.limit || 50,
    });
  }

  async pause(id: string) {
    const session = await this.getActiveSession(id);

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'paused', pausedAt: new Date() },
    });

    this.ws.emitSessionUpdate(session.clubId, {
      sessionId: id,
      status: 'paused',
      hostId: session.hostId,
    });

    return updated;
  }

  async resume(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session || session.status !== 'paused') {
      throw new BadRequestException('Сесію не можна відновити');
    }

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'active', pausedAt: null },
    });

    this.ws.emitSessionUpdate(session.clubId, {
      sessionId: id,
      status: 'active',
      hostId: session.hostId,
    });

    return updated;
  }

  async extend(id: string, additionalMinutes: number) {
    const session = await this.getActiveSession(id);

    const updated = await this.prisma.session.update({
      where: { id },
      data: {
        durationMin: (session.durationMin || 0) + additionalMinutes,
      },
    });

    this.ws.emitSessionUpdate(session.clubId, {
      sessionId: id,
      action: 'extended',
      additionalMinutes,
      hostId: session.hostId,
    });

    return updated;
  }

  async stop(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!session || session.status === 'completed' || session.status === 'cancelled') {
      throw new BadRequestException('Сесію не можна завершити');
    }

    const endedAt = new Date();
    const actualMin = Math.ceil(
      (endedAt.getTime() - session.startedAt.getTime()) / 60000,
    );

    const updated = await this.prisma.session.update({
      where: { id },
      data: {
        status: 'completed',
        endedAt,
        actualMin,
      },
      include: { host: true, player: true },
    });

    // Free up host
    await this.prisma.host.update({
      where: { id: session.hostId },
      data: { status: 'online' },
    });

    // Update player stats
    if (session.playerId && session.amount) {
      await this.prisma.player.update({
        where: { id: session.playerId },
        data: {
          totalHours: { increment: actualMin / 60 },
          totalSpent: { increment: Number(session.amount) },
        },
      });
    }

    this.ws.emitSessionUpdate(session.clubId, {
      sessionId: id,
      status: 'completed',
      hostId: session.hostId,
    });

    this.ws.emitHostStatus(session.clubId, {
      hostId: session.hostId,
      status: 'online',
    });

    return updated;
  }

  private async getActiveSession(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session || session.status !== 'active') {
      throw new BadRequestException('Активну сесію не знайдено');
    }
    return session;
  }
}
