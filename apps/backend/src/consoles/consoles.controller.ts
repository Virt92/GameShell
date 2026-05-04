import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConsolesService } from './consoles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Consoles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consoles')
export class ConsolesController {
  constructor(private readonly consolesService: ConsolesService) {}

  @Get()
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'Список консолей клубу' })
  findAll(@CurrentUser('clubId') clubId: string) {
    return this.consolesService.findByClub(clubId);
  }

  @Post(':id/playactor')
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'Управління PS5 через playactor (wake/standby)' })
  playactorCommand(@Param('id') id: string, @Body('command') command: 'wake' | 'standby') {
    return this.consolesService.sendPlayactorCommand(id, command);
  }

  @Post(':id/tasmota')
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'Управління живленням через Tasmota (on/off)' })
  tasmotaCommand(@Param('id') id: string, @Body('command') command: 'on' | 'off') {
    return this.consolesService.sendTasmotaCommand(id, command);
  }

  @Post(':id/cec')
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'CEC-команда ТВ' })
  cecCommand(@Param('id') id: string, @Body() body: { command: string; payload?: Record<string, unknown> }) {
    return this.consolesService.sendCecCommand(id, body.command as any, body.payload);
  }

  @Post(':id/end-session')
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'Завершити сесію консолі (playactor + CEC + tasmota fallback)' })
  endSession(@Param('id') id: string) {
    return this.consolesService.endConsoleSession(id);
  }
}
