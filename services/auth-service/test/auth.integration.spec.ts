import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration Tests (e2e)', () => {
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

  describe('/auth/login (POST)', () => {
    it('deve retornar erro 400 para credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'usuario_inexistente',
          password: 'senha_incorreta'
        })
        .expect(400);
    });

    it('deve retornar erro 400 para dados faltando', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'teste'
          // password faltando
        })
        .expect(400);
    });
  });

  describe('/auth/register (POST)', () => {
    it('deve retornar erro 400 para dados inválidos', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'a', // muito curto
          password: '123', // muito curto
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
