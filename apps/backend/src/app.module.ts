import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ClubsModule } from './clubs/clubs.module';
import { HostsModule } from './hosts/hosts.module';
import { SessionsModule } from './sessions/sessions.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { StaffModule } from './staff/staff.module';
import { PlayersModule } from './players/players.module';
import { GamesModule } from './games/games.module';
import { ShopModule } from './shop/shop.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ReportsModule } from './reports/reports.module';
import { ConsolesModule } from './consoles/consoles.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    WebsocketModule,
    AuthModule,
    ClubsModule,
    HostsModule,
    SessionsModule,
    TariffsModule,
    StaffModule,
    PlayersModule,
    GamesModule,
    ShopModule,
    LoyaltyModule,
    ReportsModule,
    ConsolesModule,
  ],
})
export class AppModule {}
