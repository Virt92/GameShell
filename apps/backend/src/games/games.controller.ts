import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Каталог ігор' })
  findAll(@CurrentUser('clubId') clubId: string) {
    return this.gamesService.findByClub(clubId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Додати гру' })
  create(@CurrentUser('clubId') clubId: string, @Body() data: any) {
    return this.gamesService.create(clubId, data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Оновити гру' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.gamesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Видалити гру' })
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }

  @Post('deploy')
  @UseGuards(RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Створити завдання встановлення/оновлення' })
  deploy(@CurrentUser('clubId') clubId: string, @CurrentUser('id') userId: string, @Body() data: any) {
    return this.gamesService.createDeployTask(clubId, { ...data, createdById: userId });
  }

  @Get('deploy/:id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'devops')
  @ApiOperation({ summary: 'Статус завдання' })
  getDeployTask(@Param('id') id: string) {
    return this.gamesService.getDeployTask(id);
  }
}
