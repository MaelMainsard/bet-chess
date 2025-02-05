import { Controller, Get, Param } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Get()
    findAll() {
        return this.matchService.findAll();
    }

    @Get('ongoing')
    findAllOngoing() {
        return this.matchService.findAllOngoing();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.matchService.findById(id);
    }
}
