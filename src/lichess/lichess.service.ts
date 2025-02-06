import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import {
  Match,
  matchResultFromString,
  MatchStatus,
  MatchResult,
} from 'src/match/match';
import { Player } from 'src/player/player';
import { MatchService } from 'src/match/match.service';
import { BetService } from 'src/bet/bet.service';

@Injectable()
export class LichessService implements OnModuleInit {
  private readonly channelsUrl = 'https://lichess.org/api/tv/channels';
  private readonly streamGameUrl =
    'https://lichess.org/api/stream/games/bet-chess-stream';
  private readonly readGameUrl = 'https://lichess.org/game/export/';

  private currentStream: any = null;

  constructor(
    private readonly matchService: MatchService,
    private readonly betService: BetService,
  ) {}

  onModuleInit() {
    setTimeout(() => this.checkOngoingMatches(), 100);
    setTimeout(() => this.startWatchingBulletGames(), 1000);
  }

  // For every match with the ONGOING status, check if it already ended. If so, close the bets.
  private async checkOngoingMatches() {
    console.log('Fetching ongoing matches...');
    const matches = await this.matchService.findAllOngoing();

    for (const match of matches) {
      const response = await axios.get(this.readGameUrl + match.id);
      const game = response.data;
      if (!game) continue;
      if (game.status <= 20) continue;

      console.log('Match ended : ' + match.id);

      this.updateMatch(match.id, game);
    }
  }

  // Find a bullet game to then steam it.
  private async startWatchingBulletGames() {
    try {
      // Step 1: Fetch Lichess TV Channels to get the Bullet game ID
      const response = await axios.get(this.channelsUrl);
      const gameId = response.data?.bullet?.gameId;

      if (!gameId) {
        console.error('Bullet game ID not found!');
        setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry after 5 sec
        return;
      }

      this.streamGame(gameId);
    } catch (error) {
      console.error('Error fetching Bullet game ID:', error);
      setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry after 5 sec
    }
  }

  // Create a match corresponding to the game, and when the match ends, close the bets and find another game.
  private async streamGame(gameId: string) {
    try {
      console.log(`Streaming game ${gameId}...`);

      // Close the previous stream if it exists
      if (this.currentStream) {
        this.currentStream.destroy();
      }

      const response = await axios({
        method: 'post',
        url: this.streamGameUrl,
        headers: {
          'Content-Type': 'text/plain',
        },
        data: gameId,
        responseType: 'stream',
      });

      this.currentStream = response.data;

      response.data.on('data', async (chunk: Buffer) => {
        const jsonString = chunk.toString().trim();
        if (!jsonString) return;

        try {
          const match = await this.updateMatch(gameId, JSON.parse(jsonString));

          // Check if the game is finished
          if (match.status == MatchStatus.ENDED) {
            console.log(`Game ${gameId} finished, starting a new game...`);
            this.currentStream.destroy(); // Close current stream before restarting
            setTimeout(() => this.startWatchingBulletGames(), 10000); // Start watching a new game in 5 sec
          }
        } catch (error) {
          console.error('Error parsing game stream data:', error);
        }
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        setTimeout(() => this.startWatchingBulletGames(), 10000); // Restart
      });
    } catch (error) {
      console.error('Error connecting to game stream:', error);
      setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry
    }
  }

  // Update a match with the data from a lichess game.
  private async updateMatch(gameId: string, game): Promise<Match> {
    const match = new Match({
      id: gameId,
      whitePlayer: new Player({
        id: game.players.white.userId ?? game.players.white.user.id,
        rating: game.players.white.rating,
      }),
      blackPlayer: new Player({
        id: game.players.black.userId ?? game.players.black.user.id,
        rating: game.players.black.rating,
      }),
      status: game.status <= 20 ? MatchStatus.ONGOING : MatchStatus.ENDED,
      result:
        game.status == 34
          ? MatchResult.DRAW
          : matchResultFromString(game.winner),
    });

    await this.matchService.setMatch(match);

    if (match.result) {
      await this.betService.onMatchEnded(match);
    }

    return match;
  }
}
