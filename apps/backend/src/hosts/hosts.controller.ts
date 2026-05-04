import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { RegisterHostDto, UpdateHostDto, HostCommandDto } from './hosts.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Hosts')
@Controller('hosts')
export class HostsController {
  constructor(private readonly hostsService: HostsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового ПК/консолі' })
  register(@Body() dto: RegisterHostDto) {
    return this.hostsService.register(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Список хостів клубу' })
  findAll(@CurrentUser('clubId') clubId: string) {
    return this.hostsService.findAllByClub(clubId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Деталі хоста' })
  findOne(@Param('id') id: string) {
    return this.hostsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Оновити хост' })
  update(@Param('id') id: string, @Body() dto: UpdateHostDto) {
    return this.hostsService.update(id, dto);
  }

  @Post(':id/command')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'devops', 'operator')
  @ApiOperation({ summary: 'Відправити команду хосту' })
  sendCommand(@Param('id') id: string, @Body() dto: HostCommandDto) {
    return this.hostsService.sendCommand(id, dto);
  }

  @Get(':id/telemetry')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Телеметрія хоста' })
  getTelemetry(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.hostsService.getTelemetry(id, limit ? parseInt(limit) : 60);
  }
}
