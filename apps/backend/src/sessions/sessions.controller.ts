import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './sessions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'operator')
  @ApiOperation({ summary: 'Створити сесію' })
  create(@Body() dto: CreateSessionDto, @CurrentUser('id') operatorId: string) {
    return this.sessionsService.create(dto, operatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Активні сесії' })
  findActive(@CurrentUser('clubId') clubId: string) {
    return this.sessionsService.findActive(clubId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Історія сесій' })
  findHistory(
    @CurrentUser('clubId') clubId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('hostId') hostId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sessionsService.findHistory(clubId, {
      from,
      to,
      hostId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Put(':id/pause')
  @UseGuards(RolesGuard)
  @Roles('owner', 'operator')
  @ApiOperation({ summary: 'Пауза сесії' })
  pause(@Param('id') id: string) {
    return this.sessionsService.pause(id);
  }

  @Put(':id/resume')
  @UseGuards(RolesGuard)
  @Roles('owner', 'operator')
  @ApiOperation({ summary: 'Відновити сесію' })
  resume(@Param('id') id: string) {
    return this.sessionsService.resume(id);
  }

  @Put(':id/extend')
  @UseGuards(RolesGuard)
  @Roles('owner', 'operator')
  @ApiOperation({ summary: 'Продовжити сесію' })
  extend(@Param('id') id: string, @Body('minutes') minutes: number) {
    return this.sessionsService.extend(id, minutes);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'operator')
  @ApiOperation({ summary: 'Завершити сесію' })
  stop(@Param('id') id: string) {
    return this.sessionsService.stop(id);
  }
}
