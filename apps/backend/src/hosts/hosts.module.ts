import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [HostsController],
  providers: [HostsService],
  exports: [HostsService],
})
export class HostsModule {}
