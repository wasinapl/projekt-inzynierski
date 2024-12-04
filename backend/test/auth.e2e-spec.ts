import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { cleanDatabase } from './utils/database'
import { insertDataset } from './utils/insertDataset'

describe('Authentication (e2e)', () => {
    let app: INestApplication

    beforeAll(async () => {
        await cleanDatabase()
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    describe('POST /auth/register', () => {
        it('should register a new user and return JWT token', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'newuser@example.com', password: 'newpassword123' })
                .expect(201)
                .expect((res) => {
                    expect(res.body.access_token).toBeDefined()
                })
        })

        it('should fail when registering with an existing email', async () => {
            await insertDataset('users', 'auth_1')

            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'newuser@example.com', password: 'somepassword' })
                .expect(409)
                .then((response) => {
                    expect(response.body.message).toBe('The email address is already in use.')
                })
        })
    })

    describe('POST /auth/login', () => {
        it('should authenticate user and return JWT token', async () => {
            await insertDataset('users', 'auth_1')

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'newuser@example.com', password: 'newpassword123' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.access_token).toBeDefined()
                })
        })

        it('should fail with incorrect credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'testuser@example.com', password: 'wrongpassword' })
                .expect(401)
        })
    })
})
