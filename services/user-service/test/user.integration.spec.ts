import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('deve retornar lista de usuários', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('deve retornar erro 404 para usuário inexistente', () => {
      return request(app.getHttpServer())
        .get('/users/999999')
        .expect(404);
    });
  });

  describe('/users (POST)', () => {
    it('deve retornar erro 400 para dados inválidos', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: '', // nome vazio
          email: 'email-invalido'
        })
        .expect(400);
    });
  });

  describe('/health (GET)', () => {
    it('deve retornar status de saúde do serviço', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });
});
