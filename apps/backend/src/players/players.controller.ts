import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Players')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Список гравців' })
  findAll(@CurrentUser('clubId') clubId: string, @Query('search') search?: string) {
    return this.playersService.findByClub(clubId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Профіль гравця' })
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Post(':id/topup')
  @ApiOperation({ summary: 'Поповнити баланс' })
  topUp(@Param('id') id: string, @Body('amount') amount: number) {
    return this.playersService.topUp(id, amount);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Статистика гравця' })
  getStats(@Param('id') id: string) {
    return this.playersService.getStats(id);
  }
}
