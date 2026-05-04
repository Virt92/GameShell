import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async findByClub(clubId: string) {
    return this.prisma.game.findMany({
      where: { clubId, isActive: true },
      include: { _count: { select: { hostGames: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(clubId: string, data: any) {
    return this.prisma.game.create({ data: { ...data, clubId } });
  }

  async update(id: string, data: any) {
    return this.prisma.game.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.game.update({ where: { id }, data: { isActive: false } });
  }

  async createDeployTask(clubId: string, data: { gameId: string; action: string; targetHosts: string[]; createdById: string }) {
    const task = await this.prisma.deployTask.create({
      data: {
        clubId,
        gameId: data.gameId,
        action: data.action as any,
        targetHosts: data.targetHosts,
        createdById: data.createdById,
      },
      include: { game: true },
    });

    this.ws.emitDeployProgress(clubId, {
      taskId: task.id,
      action: data.action,
      gameName: task.game.name,
      targetHosts: data.targetHosts,
      status: 'queued',
    });

    return task;
  }

  async getDeployTask(id: string) {
    const task = await this.prisma.deployTask.findUnique({
      where: { id },
      include: { game: true, createdBy: { select: { name: true } } },
    });
    if (!task) throw new NotFoundException('Завдання не знайдено');
    return task;
  }
}
