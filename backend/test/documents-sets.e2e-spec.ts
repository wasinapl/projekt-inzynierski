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

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'newuser@example.com', password: 'newpassword123' });
        access_token = response.body.access_token;
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    describe('Documents-sets guard', () => {
        it('should get documents-sets', async () => {
            await insertDatasets([['User', 'documentsSetsTest_1']]);

            return request(app.getHttpServer())
                .get('/documents-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it("shouldn't get documents-sets", () => {
            return request(app.getHttpServer())
                .get('/documents-sets')
                .set('Authorization', `Bearer wrong`)
                .expect(401);
        });
    });

    describe('POST /documents-sets', () => {
        it('should create a new document set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'empty'],
            ]);

            const response = await request(app.getHttpServer())
                .post('/documents-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'test' })
                .expect(201);

            expect(response.body).toEqual({
                code: expect.any(String),
                name: 'test',
            });

            const { code } = response.body;
            const createdDocumentSet = await prisma.documentsSet.findUnique({
                where: { code },
            });

            expect(createdDocumentSet).toBeDefined();
            expect(createdDocumentSet?.name).toBe('test');
            expect(createdDocumentSet?.userId).toBe(1);
            expect(createdDocumentSet?.code.length).toBe(16);
        });

        it('should not create without name', async () => {
            await insertDatasets([['User', 'documentsSetsTest_1']]);

            const response = await request(app.getHttpServer())
                .post('/documents-sets')
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(400);
        });
    });

    describe('GET /documents-sets/:code', () => {
        it('should returns empty document set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
                ['Document', 'empty'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .get('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                code: expect.any(String),
                name: 'test',
                documents: [],
            });
        });

        it('should returns set with one document', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
                ['Document', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .get('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                code: '7fa609a93f13a317',
                name: 'test',
                documents: [
                    {
                        code: '481d9713ef6987c7',
                        status: 'CREATED',
                        title: 'test title',
                    },
                ],
            });
        });

        it('should returns error on not existing documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = 'wrong';

            const response = await request(app.getHttpServer())
                .get('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send()
                .expect(404);
        });
    });

    describe('PUT /documents-sets/:code', () => {
        it('should update documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';

            const response = await request(app.getHttpServer())
                .put('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(200);

            expect(response.body).toEqual({
                code: '7fa609a93f13a317',
                name: 'new name',
            });

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
                .put('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(404);
        });
    });

    describe('DELETE /documents-sets/:code', () => {
        it('should delete documents set', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
                ['Document', 'documentsSetsTest_1'],
                ['DocumentPart', 'documentsSetsTest_1'],
            ]);

            const code = '7fa609a93f13a317';
            const documentcode = '481d9713ef6987c7';

            const response = await request(app.getHttpServer())
                .delete('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Document set deleted successfully',
            });

            const deleteDocumentSet = await prisma.documentsSet.findUnique({
                where: { code },
            });
            const deleteDocument = await prisma.document.findUnique({
                where: { code: documentcode },
            });

            const removedDocumentPart1 = await prisma.documentPart.findUnique({
                where: { id: 1 },
            });
            const removedDocumentPart2 = await prisma.documentPart.findUnique({
                where: { id: 2 },
            });

            expect(deleteDocumentSet).toBeNull();
            expect(deleteDocument).toBeNull();
            expect(removedDocumentPart1).toBeNull();
            expect(removedDocumentPart2).toBeNull();
        });

        it('should not delete wrong code', async () => {
            await insertDatasets([
                ['User', 'documentsSetsTest_1'],
                ['DocumentsSet', 'documentsSetsTest_1'],
            ]);

            const code = 'wrong';

            await request(app.getHttpServer())
                .delete('/documents-sets/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ name: 'new name' })
                .expect(404);
        });
    });
});
