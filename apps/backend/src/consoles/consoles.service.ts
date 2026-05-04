import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ConsolesService {
  private readonly logger = new Logger(ConsolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async findByClub(clubId: string) {
    return this.prisma.host.findMany({
      where: {
        clubId,
        type: { in: ['ps5', 'ps4', 'ps2'] },
      },
      include: {
        zone: true,
        sessions: {
          where: { status: 'active' },
          include: { player: true },
        },
      },
    });
  }

  async sendPlayactorCommand(hostId: string, command: 'wake' | 'standby') {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) return;

    // Forward to Local Hub via WebSocket, which controls playactor
    this.ws.emitHostStatus(host.clubId, {
      hostId,
      command: `playactor:${command}`,
      ipAddress: host.ipAddress,
    });

    this.logger.log(`Playactor command ${command} sent to ${host.name} (${host.ipAddress})`);
    return { success: true, command, hostName: host.name };
  }

  async sendTasmotaCommand(hostId: string, command: 'on' | 'off') {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host || !host.tasmotaTopic) return;

    // Forward MQTT command via Local Hub
    this.ws.emitHostStatus(host.clubId, {
      hostId,
      command: `tasmota:${command}`,
      topic: host.tasmotaTopic,
    });

    this.logger.log(`Tasmota command ${command} for ${host.name} (${host.tasmotaTopic})`);
    return { success: true, command, hostName: host.name };
  }

  async sendCecCommand(hostId: string, command: 'tv_on' | 'tv_off' | 'show_message', payload?: Record<string, unknown>) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host || !host.cecDeviceId) return;

    this.ws.emitHostStatus(host.clubId, {
      hostId,
      command: `cec:${command}`,
      cecDeviceId: host.cecDeviceId,
      payload,
    });

    return { success: true, command, hostName: host.name };
  }

  async endConsoleSession(hostId: string) {
    const host = await this.prisma.host.findUnique({
      where: { id: hostId },
      include: { sessions: { where: { status: 'active' } } },
    });
    if (!host) return;

    // Step 1: Send CEC message warning (5 min)
    if (host.cecDeviceId) {
      await this.sendCecCommand(hostId, 'show_message', {
        text: 'Ваша сесія закінчується через 5 хвилин',
        durationSec: 10,
      });
    }

    // Step 2: After 5 min, send standby via playactor (if PS5)
    if (host.controlMethod === 'playactor') {
      await this.sendPlayactorCommand(hostId, 'standby');
    }

    // Step 3: Fallback - Tasmota power off (if playactor fails after 30sec)
    if (host.tasmotaTopic) {
      // This would be scheduled by Local Hub after timeout
      this.ws.emitHostStatus(host.clubId, {
        hostId,
        command: 'schedule:tasmota_off',
        delaySec: 30,
        topic: host.tasmotaTopic,
      });
    }

    return { success: true, hostName: host.name };
  }
}
