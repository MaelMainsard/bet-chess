import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MatchService } from '../src/match/match.service';
import { Match, MatchResult, MatchStatus } from 'src/match/match';
import { Player } from 'src/player/player';

describe('MatchController (e2e)', () => {
  let app: INestApplication;
  let matchService: MatchService;
  let createdMatchIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    matchService = moduleFixture.get<MatchService>(MatchService);

    // Création de matchs pour les tests
    const match1 = new Match({
      id: "1",
      whitePlayer: new Player({
        id: "necati",
        rating: 800,
      }),
      blackPlayer: new Player({
        id: "maxence",
        rating: 900,
      }),
      status: MatchStatus.ONGOING,
      result: null,
    });
    
    const match2 = new Match({
      id: "2",
      whitePlayer: new Player({
        id: "maxence",
        rating: 800,
      }),
      blackPlayer: new Player({
        id: "symeon",
        rating: 2000,
      }),
      status: MatchStatus.ENDED,
      result: MatchResult.BLACK,
    });
    
    await matchService.setMatch(match1);
    await matchService.setMatch(match2);
    
    createdMatchIds.push(match1.id, match2.id);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/match/:id (GET) - doit retourner un match existant', async () => {
    const matchId = createdMatchIds[0];

    const response = await request(app.getHttpServer())
      .get(`/match/${matchId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', matchId);
    expect(response.body).toHaveProperty('status', 'SCHEDULED');
  });

  it('/match/ongoing (GET) - doit retourner les matchs en cours', async () => {
    const response = await request(app.getHttpServer())
      .get('/match/ongoing')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((match) => match.status === 'ONGOING')).toBe(true);
  });
});
