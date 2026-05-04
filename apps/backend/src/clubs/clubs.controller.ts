import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto } from './clubs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Clubs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @Roles('owner')
  @ApiOperation({ summary: 'Створити клуб' })
  create(@Body() dto: CreateClubDto) {
    return this.clubsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список клубів' })
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Деталі клубу' })
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Put(':id')
  @Roles('owner')
  @ApiOperation({ summary: 'Оновити клуб' })
  update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('owner')
  @ApiOperation({ summary: 'Видалити клуб' })
  remove(@Param('id') id: string) {
    return this.clubsService.remove(id);
  }
}
