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
                .expect(400)
        })
    })

    // describe('POST /auth/login', () => {
    //     it.only('should authenticate user and return JWT token', () => {
    //         return request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({ email: 'testuser@example.com', password: 'password123' })
    //             .expect(200)
    //             .expect((res) => {
    //                 expect(res.body.access_token).toBeDefined()
    //             })
    //     })

    //     it('should fail with incorrect credentials', () => {
    //         return request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({ email: 'testuser@example.com', password: 'wrongpassword' })
    //             .expect(401)
    //     })
    // })

    // describe('GET /auth/profile', () => {
    //     let jwtToken: string

    //     beforeEach(async () => {
    //         const loginResponse = await request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({ email: 'testuser@example.com', password: 'password123' })
    //         jwtToken = loginResponse.body.access_token
    //     })

    //     it('should get user profile when authenticated', () => {
    //         return request(app.getHttpServer())
    //             .get('/auth/profile')
    //             .set('Authorization', `Bearer ${jwtToken}`)
    //             .expect(200)
    //             .expect((res) => {
    //                 expect(res.body.email).toBe('testuser@example.com')
    //                 expect(res.body.role).toBe('USER')
    //             })
    //     })

    //     it('should fail to get profile when not authenticated', () => {
    //         return request(app.getHttpServer()).get('/auth/profile').expect(401)
    //     })
    // })
})
