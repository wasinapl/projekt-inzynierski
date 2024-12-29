import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/database';
import { insertDatasets } from './utils/insertDataset';
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

        await insertDatasets([['User', 'documentsSetsTest_1']]);

        access_token = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'newuser@example.com', password: 'newpassword123' })
            .then((res) => {
                return res.body.access_token;
            });
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Document-sets guard', () => {
        it('should get document-sets', async () => {
            await insertDatasets([['User', 'documentsSetsTest_1']]);

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
            await insertDatasets([['User', 'documentsSetsTest_1']]);

            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'test' })
                .expect(201);

            expect(response.body).toEqual(
                expect.objectContaining({
                    code: expect.any(String),
                    name: 'test',
                })
            );

            const { code } = response.body;
            const createdDocumentSet = await prisma.documentsSet.findUnique({
                where: { code },
            });

            expect(createdDocumentSet).toBeDefined();
            expect(createdDocumentSet?.id).toBe(1);
            expect(createdDocumentSet?.name).toBe('test');
            expect(createdDocumentSet?.userId).toBe(1);
            expect(createdDocumentSet?.code.length).toBe(16);
        });

        it('should not create without name', async () => {
            await insertDatasets([['User', 'documentsSetsTest_1']]);

            const response = await request(app.getHttpServer())
                .post('/document-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(400);
        });
    });

    describe('GET /document-sets/:code', () => {
        it('should returns empty document set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .get('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    code: expect.any(String),
                    name: 'test',
                })
            );
        });

        it('should returns error on not existing documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = 'wrong';

            const response = await request(app.getHttpServer())
                .get('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(404);
        });
    });

    describe('PUT /document-sets/:code', () => {
        it('should update documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .put('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    code: expect.any(String),
                    name: 'new name',
                })
            );

            const updatedDocumentSet = await prisma.documentsSet.findUnique({
                where: { code },
            });

            expect(updatedDocumentSet).toEqual(
                expect.objectContaining({
                    id: 1,
                    code: '7fa609a93f13a317',
                    name: 'new name',
                    userId: 1,
                })
            );
        });

        it('should not update wrong code', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = 'wrong';

            await request(app.getHttpServer())
                .put('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(404);
        });
    });

    describe('DELETE /document-sets/:code', () => {
        it('should delete documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .delete('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Document set deleted successfully',
            });

            const deleteDocumentSet = await prisma.documentsSet.findUnique({
                where: { code },
            });

            expect(deleteDocumentSet).toEqual(null);
        });

        it('should not delete wrong code', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = 'wrong';

            await request(app.getHttpServer())
                .delete('/document-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(404);
        });
    });
});
