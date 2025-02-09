import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AddBetDto } from './dto/add-bet.dto';
import { Bet } from './interfaces/bet.interface';
import { BetService } from './bet.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createBetBody } from './constant/api.example';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/user';

@ApiTags('Bet')
@Controller('bet')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody(createBetBody)
  async createBet(
    @Body() credentials: AddBetDto,
    @CurrentUser() user: User,
  ): Promise<Bet> {
    return this.betService.newBet(credentials, user);
  }
}
