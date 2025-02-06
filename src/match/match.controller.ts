import { Controller, Get, Param } from '@nestjs/common';
import { MatchService } from './match.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('ongoing')
  findAllOngoing() {
    return this.matchService.findAllOngoing();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchService.findById(id);
  }
}
