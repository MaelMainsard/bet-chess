import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MatchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],  // Importe toute l'application
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/match/:id (GET) - doit retourner un match existant', async () => {
    const matchId = 'AYrVhcsU'; // ID de test existant

    const response = await request(app.getHttpServer())
      .get(`/match/${matchId}`)
      .expect(200); // Vérifie que la requête renvoie un code 200

    expect(response.body).toHaveProperty('id', matchId);
    expect(response.body).toHaveProperty('status');
  });

  it('/match/ongoing (GET) - doit retourner les matchs en cours', async () => {
    const response = await request(app.getHttpServer())
      .get('/match/ongoing')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('status', 'ONGOING');
    }
  });
});
