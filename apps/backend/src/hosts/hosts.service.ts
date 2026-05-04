import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { RegisterHostDto, UpdateHostDto, HostCommandDto } from './hosts.dto';

@Injectable()
export class HostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async register(dto: RegisterHostDto) {
    const host = await this.prisma.host.create({
      data: {
        clubId: dto.clubId,
        name: dto.name,
        type: dto.type as any,
        macAddress: dto.macAddress,
        ipAddress: dto.ipAddress,
        hostname: dto.hostname,
        hardware: dto.hardware as any,
        controlMethod: dto.controlMethod as any ?? 'agent',
        status: 'online',
      },
    });

    this.ws.emitHostStatus(dto.clubId, {
      hostId: host.id,
      status: 'online',
      action: 'registered',
    });

    return host;
  }

  async findAllByClub(clubId: string) {
    return this.prisma.host.findMany({
      where: { clubId },
      include: {
        zone: true,
        sessions: {
          where: { status: 'active' },
          include: { player: true, tariff: true },
        },
      },
      orderBy: [{ zone: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const host = await this.prisma.host.findUnique({
      where: { id },
      include: {
        zone: true,
        sessions: {
          where: { status: 'active' },
          include: { player: true, tariff: true },
        },
        hostGames: { include: { game: true } },
      },
    });
    if (!host) throw new NotFoundException('Хост не знайдено');
    return host;
  }

  async update(id: string, dto: UpdateHostDto) {
    return this.prisma.host.update({ where: { id }, data: dto as any });
  }

  async sendCommand(id: string, dto: HostCommandDto) {
    const host = await this.prisma.host.findUnique({ where: { id } });
    if (!host) throw new NotFoundException('Хост не знайдено');

    // Emit command via WebSocket to Local Hub
    this.ws.emitHostStatus(host.clubId, {
      hostId: id,
      command: dto.command,
      payload: dto.payload,
    });

    return { success: true, command: dto.command, hostId: id };
  }

  async updateTelemetry(
    hostId: string,
    data: {
      cpuUsage?: number;
      gpuUsage?: number;
      ramUsage?: number;
      cpuTemp?: number;
      gpuTemp?: number;
      diskUsage?: Record<string, number>;
    },
  ) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) return;

    await this.prisma.hostTelemetry.create({
      data: {
        hostId,
        cpuUsage: data.cpuUsage,
        gpuUsage: data.gpuUsage,
        ramUsage: data.ramUsage,
        cpuTemp: data.cpuTemp,
        gpuTemp: data.gpuTemp,
        diskUsage: data.diskUsage ?? undefined,
      },
    });

    this.ws.emitHostStatus(host.clubId, {
      hostId,
      telemetry: data,
    });
  }

  async getTelemetry(hostId: string, limit = 60) {
    return this.prisma.hostTelemetry.findMany({
      where: { hostId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }
}
