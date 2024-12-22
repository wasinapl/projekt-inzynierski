import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/database';
import { insertDataset } from './utils/insertDataset';
import { PrismaService } from '../src/prisma/prisma.service';

describe('document sets (e2e)', () => {
    let app: INestApplication;
    let access_token: string;
    let prisma: PrismaService;

    beforeAll(async () => {
        await cleanDatabase();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        // Insert test data
        await insertDataset('user', 'documentsSetsTest_1');

        access_token = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'newuser@example.com', password: 'newpassword123' })
            .then((res) => {
                return res.body.access_token;
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Document-sets guard', () => {
        it('should get document-sets', () => {
            return request(app.getHttpServer())
                .get('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it("shouldn't get document-sets", () => {
            return request(app.getHttpServer())
                .get('/document-sets')
                .set('Authorization', `Bearer wrong`)
                .expect(401);
        });
    });

    describe('POST /document-sets', () => {
        it('should create a new document set', async () => {
            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'test' })
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body.id).toBeDefined();

            const { id } = response.body;
            const createdDocumentSet = await prisma.documentsSet.findUnique({
                where: { id },
            });

            expect(createdDocumentSet).toBeDefined();
            expect(createdDocumentSet?.name).toBe('test');
            expect(createdDocumentSet?.userId).toBe(1);
        });

        it('should not create without name', async () => {
            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(400);
        });
    });

    describe('GET /document-sets', () => {
        it('should create a new document set', async () => {
            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'test' })
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body.id).toBeDefined();

            const { id } = response.body;
            const createdDocumentSet = await prisma.documentsSet.findUnique({
                where: { id },
            });

            expect(createdDocumentSet).toBeDefined();
            expect(createdDocumentSet?.name).toBe('test');
            expect(createdDocumentSet?.userId).toBe(1);
        });

        it('should not create without name', async () => {
            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(400);
        });
    });

    // describe('POST /auth/login', () => {
    //     it('should authenticate user and return JWT token', async () => {
    //         await insertDataset('users', 'auth_1');

    //         return request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({
    //                 email: 'newuser@example.com',
    //                 password: 'newpassword123',
    //             })
    //             .expect(200)
    //             .expect((res) => {
    //                 expect(res.body.access_token).toBeDefined();
    //             });
    //     });

    //     it('should fail with incorrect credentials', () => {
    //         return request(app.getHttpServer())
    //             .post('/auth/login')
    //             .send({
    //                 email: 'testuser@example.com',
    //                 password: 'wrongpassword',
    //             })
    //             .expect(401);
    //     });
    // });
});
