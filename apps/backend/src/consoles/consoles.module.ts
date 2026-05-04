import { Module } from '@nestjs/common';
import { ConsolesService } from './consoles.service';
import { ConsolesController } from './consoles.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [ConsolesController],
  providers: [ConsolesService],
  exports: [ConsolesService],
})
export class ConsolesModule {}
