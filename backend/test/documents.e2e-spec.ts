import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/database';
import { insertDatasets } from './utils/insertDataset';
import { PrismaService } from '../src/prisma/prisma.service';
import { Queue, QueueEvents } from 'bullmq';

describe('documents (e2e)', () => {
    let app: INestApplication;
    let access_token: string;
    let prisma: PrismaService;
    let queueEvents: QueueEvents;
    let myQueue: Queue;

    beforeAll(async () => {
        await cleanDatabase();

        queueEvents = new QueueEvents('document-queue', {
            connection: { host: 'localhost', port: 6379 },
        });
        myQueue = new Queue('document-queue', {
            connection: { host: 'localhost', port: 6379 },
        });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await insertDatasets([['User', 'documentsTest_1']]);

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'newuser@example.com', password: 'newpassword123' });
        access_token = response.body.access_token;
    });

    beforeEach(async () => {
        await cleanDatabase();
        await myQueue.obliterate({ force: true });
    });

    afterAll(async () => {
        await queueEvents.close();
        await myQueue.close();
        await prisma.$disconnect();
        await app.close();
    });

    describe('Documents guard', () => {
        it('should get documents', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            return request(app.getHttpServer())
                .get('/documents')
                .set('Authorization', `Bearer ${access_token}`)
                .query({ documentsSetCode: '7fa609a93f13a317' })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it("shouldn't get documents", () => {
            return request(app.getHttpServer())
                .get('/documents')
                .set('Authorization', `Bearer wrong`)
                .expect(401);
        });
    });

    describe('POST /documents/from-text', () => {
        it('should create a new document set', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const waitingJobs: any[] = [];
            queueEvents.on('waiting', ({ jobId }) => {
                waitingJobs.push(jobId);
            });

            const response = await request(app.getHttpServer())
                .post('/documents/from-text')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    title: 'test title',
                    content:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lectus dui, sodales eu rhoncus a, lacinia a purus. Sed pharetra leo eros, vel bibendum odio malesuada in. Sed eu massa sed sem dignissim cursus. Nam ligula nulla, euismod sed lacus sit amet, faucibus fringilla lectus. Duis at nunc elit. Etiam iaculis lectus massa, in pharetra est iaculis id. Aliquam ultrices blandit ex vitae scelerisque. Nullam sed fermentum lorem. Sed in viverra tellus, eleifend accumsan metus. Proin vel consectetur tortor, eget feugiat ligula. Proin imperdiet convallis sem, a tristique arcu pulvinar eu. Proin a felis convallis, pulvinar diam id, dictum justo. Morbi volutpat rutrum mauris, vel varius nisi varius vel. Fusce vitae mauris in enim efficitur convallis ac volutpat lectus. Morbi nec condimentum eros. Sed ut mattis tellus. Mauris consequat enim dolor, non fermentum leo bibendum et. Ut purus massa, sollicitudin at aliquet vel, porttitor non nulla. Curabitur accumsan est elit, vitae tempor dui iaculis quis. Nullam turpis nisl, lobortis vitae finibus eu, efficitur non massa. Sed consectetur, justo sit amet elementum pharetra, ipsum nibh auctor dolor, non aliquam lectus dui at arcu. Pellentesque blandit libero at porta interdum. Nullam in urna rhoncus nisi condimentum dictum ac in nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur suscipit at erat vel porttitor. Donec feugiat nulla in risus sodales, at fringilla ipsum dictum. Etiam elementum ullamcorper velit eget mollis. In in libero sed lorem placerat mollis. Integer pulvinar ornare sapien, ac ultricies ipsum placerat in. Vivamus in dolor eget odio aliquam viverra. Ut lacinia placerat libero eu viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis malesuada lacus. Mauris tortor tellus, lobortis id ligula vitae, mattis elementum ligula. Duis rutrum laoreet sollicitudin. Suspendisse vel sagittis enim. Phasellus sed sapien sit amet nunc dictum lobortis et eu felis. In eget risus et quam ullamcorper efficitur eu vel neque. Proin congue, ante quis pharetra congue, nunc libero vulputate neque, id venenatis felis diam a augue. Donec porta odio quam, id pellentesque velit finibus a. Sed at tristique enim. Nam luctus in mauris a malesuada. Cras pulvinar lacinia diam, et sollicitudin purus ultrices eu. Nunc iaculis diam eu risus tincidunt blandit. Nulla iaculis bibendum mattis. Nunc luctus risus semper suscipit fermentum. Phasellus eleifend lacus vitae eleifend eleifend. Vivamus ut dui semper, vestibulum sem eget, commodo leo. Fusce lorem metus, laoreet eu finibus a, efficitur quis justo. Aliquam nec dictum risus. Nam imperdiet hendrerit suscipit. Suspendisse lobortis nulla placerat turpis scelerisque, semper sodales sem bibendum. Donec at placerat nunc. Aliquam luctus fringilla urna, eget semper mi luctus sed. Phasellus eu blandit quam, eu convallis magna. Aliquam quis ex eu justo feugiat congue eu a leo. Mauris pharetra bibendum efficitur. Sed iaculis nec felis vel mattis. Donec egestas tellus vitae tincidunt tempor. Vivamus magna elit, pharetra et consequat id, molestie sit amet justo. Nunc non vestibulum felis. Sed quis nisi ut lorem vehicula pulvinar. Nulla convallis at mauris vitae tempor. Nulla fermentum arcu quis augue fringilla, luctus pulvinar urna lobortis. Aliquam in odio porttitor, eleifend ligula in, tincidunt neque.',
                    documentsSetCode: '7fa609a93f13a317',
                })
                .expect(201);

            expect(response.body).toEqual({
                code: expect.any(String),
                title: 'test title',
                content:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lectus dui, sodales eu rhoncus a, lacinia a purus. Sed pharetra leo eros, vel bibendum odio malesuada in. Sed eu massa sed sem dignissim cursus. Nam ligula nulla, euismod sed lacus sit amet, faucibus fringilla lectus. Duis at nunc elit. Etiam iaculis lectus massa, in pharetra est iaculis id. Aliquam ultrices blandit ex vitae scelerisque. Nullam sed fermentum lorem. Sed in viverra tellus, eleifend accumsan metus. Proin vel consectetur tortor, eget feugiat ligula. Proin imperdiet convallis sem, a tristique arcu pulvinar eu. Proin a felis convallis, pulvinar diam id, dictum justo. Morbi volutpat rutrum mauris, vel varius nisi varius vel. Fusce vitae mauris in enim efficitur convallis ac volutpat lectus. Morbi nec condimentum eros. Sed ut mattis tellus. Mauris consequat enim dolor, non fermentum leo bibendum et. Ut purus massa, sollicitudin at aliquet vel, porttitor non nulla. Curabitur accumsan est elit, vitae tempor dui iaculis quis. Nullam turpis nisl, lobortis vitae finibus eu, efficitur non massa. Sed consectetur, justo sit amet elementum pharetra, ipsum nibh auctor dolor, non aliquam lectus dui at arcu. Pellentesque blandit libero at porta interdum. Nullam in urna rhoncus nisi condimentum dictum ac in nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur suscipit at erat vel porttitor. Donec feugiat nulla in risus sodales, at fringilla ipsum dictum. Etiam elementum ullamcorper velit eget mollis. In in libero sed lorem placerat mollis. Integer pulvinar ornare sapien, ac ultricies ipsum placerat in. Vivamus in dolor eget odio aliquam viverra. Ut lacinia placerat libero eu viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis malesuada lacus. Mauris tortor tellus, lobortis id ligula vitae, mattis elementum ligula. Duis rutrum laoreet sollicitudin. Suspendisse vel sagittis enim. Phasellus sed sapien sit amet nunc dictum lobortis et eu felis. In eget risus et quam ullamcorper efficitur eu vel neque. Proin congue, ante quis pharetra congue, nunc libero vulputate neque, id venenatis felis diam a augue. Donec porta odio quam, id pellentesque velit finibus a. Sed at tristique enim. Nam luctus in mauris a malesuada. Cras pulvinar lacinia diam, et sollicitudin purus ultrices eu. Nunc iaculis diam eu risus tincidunt blandit. Nulla iaculis bibendum mattis. Nunc luctus risus semper suscipit fermentum. Phasellus eleifend lacus vitae eleifend eleifend. Vivamus ut dui semper, vestibulum sem eget, commodo leo. Fusce lorem metus, laoreet eu finibus a, efficitur quis justo. Aliquam nec dictum risus. Nam imperdiet hendrerit suscipit. Suspendisse lobortis nulla placerat turpis scelerisque, semper sodales sem bibendum. Donec at placerat nunc. Aliquam luctus fringilla urna, eget semper mi luctus sed. Phasellus eu blandit quam, eu convallis magna. Aliquam quis ex eu justo feugiat congue eu a leo. Mauris pharetra bibendum efficitur. Sed iaculis nec felis vel mattis. Donec egestas tellus vitae tincidunt tempor. Vivamus magna elit, pharetra et consequat id, molestie sit amet justo. Nunc non vestibulum felis. Sed quis nisi ut lorem vehicula pulvinar. Nulla convallis at mauris vitae tempor. Nulla fermentum arcu quis augue fringilla, luctus pulvinar urna lobortis. Aliquam in odio porttitor, eleifend ligula in, tincidunt neque.',
                status: 'CREATED',
            });

            const { code } = response.body;
            const createdDocument = await prisma.document.findUnique({
                where: { code },
            });

            expect(createdDocument).toBeDefined();
            expect(createdDocument?.title).toBe('test title');
            expect(createdDocument?.content).toBe(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lectus dui, sodales eu rhoncus a, lacinia a purus. Sed pharetra leo eros, vel bibendum odio malesuada in. Sed eu massa sed sem dignissim cursus. Nam ligula nulla, euismod sed lacus sit amet, faucibus fringilla lectus. Duis at nunc elit. Etiam iaculis lectus massa, in pharetra est iaculis id. Aliquam ultrices blandit ex vitae scelerisque. Nullam sed fermentum lorem. Sed in viverra tellus, eleifend accumsan metus. Proin vel consectetur tortor, eget feugiat ligula. Proin imperdiet convallis sem, a tristique arcu pulvinar eu. Proin a felis convallis, pulvinar diam id, dictum justo. Morbi volutpat rutrum mauris, vel varius nisi varius vel. Fusce vitae mauris in enim efficitur convallis ac volutpat lectus. Morbi nec condimentum eros. Sed ut mattis tellus. Mauris consequat enim dolor, non fermentum leo bibendum et. Ut purus massa, sollicitudin at aliquet vel, porttitor non nulla. Curabitur accumsan est elit, vitae tempor dui iaculis quis. Nullam turpis nisl, lobortis vitae finibus eu, efficitur non massa. Sed consectetur, justo sit amet elementum pharetra, ipsum nibh auctor dolor, non aliquam lectus dui at arcu. Pellentesque blandit libero at porta interdum. Nullam in urna rhoncus nisi condimentum dictum ac in nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur suscipit at erat vel porttitor. Donec feugiat nulla in risus sodales, at fringilla ipsum dictum. Etiam elementum ullamcorper velit eget mollis. In in libero sed lorem placerat mollis. Integer pulvinar ornare sapien, ac ultricies ipsum placerat in. Vivamus in dolor eget odio aliquam viverra. Ut lacinia placerat libero eu viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis malesuada lacus. Mauris tortor tellus, lobortis id ligula vitae, mattis elementum ligula. Duis rutrum laoreet sollicitudin. Suspendisse vel sagittis enim. Phasellus sed sapien sit amet nunc dictum lobortis et eu felis. In eget risus et quam ullamcorper efficitur eu vel neque. Proin congue, ante quis pharetra congue, nunc libero vulputate neque, id venenatis felis diam a augue. Donec porta odio quam, id pellentesque velit finibus a. Sed at tristique enim. Nam luctus in mauris a malesuada. Cras pulvinar lacinia diam, et sollicitudin purus ultrices eu. Nunc iaculis diam eu risus tincidunt blandit. Nulla iaculis bibendum mattis. Nunc luctus risus semper suscipit fermentum. Phasellus eleifend lacus vitae eleifend eleifend. Vivamus ut dui semper, vestibulum sem eget, commodo leo. Fusce lorem metus, laoreet eu finibus a, efficitur quis justo. Aliquam nec dictum risus. Nam imperdiet hendrerit suscipit. Suspendisse lobortis nulla placerat turpis scelerisque, semper sodales sem bibendum. Donec at placerat nunc. Aliquam luctus fringilla urna, eget semper mi luctus sed. Phasellus eu blandit quam, eu convallis magna. Aliquam quis ex eu justo feugiat congue eu a leo. Mauris pharetra bibendum efficitur. Sed iaculis nec felis vel mattis. Donec egestas tellus vitae tincidunt tempor. Vivamus magna elit, pharetra et consequat id, molestie sit amet justo. Nunc non vestibulum felis. Sed quis nisi ut lorem vehicula pulvinar. Nulla convallis at mauris vitae tempor. Nulla fermentum arcu quis augue fringilla, luctus pulvinar urna lobortis. Aliquam in odio porttitor, eleifend ligula in, tincidunt neque.'
            );
            expect(createdDocument?.userId).toBe(1);
            expect(createdDocument?.code.length).toBe(16);

            const createdDocumentParts = await prisma.documentPart.findMany({
                where: { documentId: createdDocument?.id },
            });

            expect(createdDocumentParts).toHaveLength(2);
            expect(createdDocumentParts[0].tokens).toBe(499);
            expect(createdDocumentParts[0].content).toBe(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lectus dui, sodales eu rhoncus a, lacinia a purus. Sed pharetra leo eros, vel bibendum odio malesuada in. Sed eu massa sed sem dignissim cursus. Nam ligula nulla, euismod sed lacus sit amet, faucibus fringilla lectus. Duis at nunc elit. Etiam iaculis lectus massa, in pharetra est iaculis id. Aliquam ultrices blandit ex vitae scelerisque. Nullam sed fermentum lorem. Sed in viverra tellus, eleifend accumsan metus. Proin vel consectetur tortor, eget feugiat ligula. Proin imperdiet convallis sem, a tristique arcu pulvinar eu. Proin a felis convallis, pulvinar diam id, dictum justo. Morbi volutpat rutrum mauris, vel varius nisi varius vel. Fusce vitae mauris in enim efficitur convallis ac volutpat lectus. Morbi nec condimentum eros. Sed ut mattis tellus. Mauris consequat enim dolor, non fermentum leo bibendum et. Ut purus massa, sollicitudin at aliquet vel, porttitor non nulla. Curabitur accumsan est elit, vitae tempor dui iaculis quis. Nullam turpis nisl, lobortis vitae finibus eu, efficitur non massa. Sed consectetur, justo sit amet elementum pharetra, ipsum nibh auctor dolor, non aliquam lectus dui at arcu. Pellentesque blandit libero at porta interdum. Nullam in urna rhoncus nisi condimentum dictum ac in nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur suscipit at erat vel porttitor. Donec feugiat nulla in risus sodales, at fringilla ipsum dictum. Etiam elementum ullamcorper velit eget mollis. In in libero sed lorem placerat mollis. Integer pulvinar ornare sapien, ac ultricies ipsum placerat in. Vivamus in dolor eget odio aliquam viverra. Ut lacinia placerat libero eu viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis malesuada lacus. Mauris tortor tellus, lobortis id ligula vitae, mattis elementum ligula. Duis rutrum laoreet sollicitudin. Suspendisse vel sagittis enim.'
            );
            expect(createdDocumentParts[1].tokens).toBe(373);
            expect(createdDocumentParts[1].content).toBe(
                'Phasellus sed sapien sit amet nunc dictum lobortis et eu felis. In eget risus et quam ullamcorper efficitur eu vel neque. Proin congue, ante quis pharetra congue, nunc libero vulputate neque, id venenatis felis diam a augue. Donec porta odio quam, id pellentesque velit finibus a. Sed at tristique enim. Nam luctus in mauris a malesuada. Cras pulvinar lacinia diam, et sollicitudin purus ultrices eu. Nunc iaculis diam eu risus tincidunt blandit. Nulla iaculis bibendum mattis. Nunc luctus risus semper suscipit fermentum. Phasellus eleifend lacus vitae eleifend eleifend. Vivamus ut dui semper, vestibulum sem eget, commodo leo. Fusce lorem metus, laoreet eu finibus a, efficitur quis justo. Aliquam nec dictum risus. Nam imperdiet hendrerit suscipit. Suspendisse lobortis nulla placerat turpis scelerisque, semper sodales sem bibendum. Donec at placerat nunc. Aliquam luctus fringilla urna, eget semper mi luctus sed. Phasellus eu blandit quam, eu convallis magna. Aliquam quis ex eu justo feugiat congue eu a leo. Mauris pharetra bibendum efficitur. Sed iaculis nec felis vel mattis. Donec egestas tellus vitae tincidunt tempor. Vivamus magna elit, pharetra et consequat id, molestie sit amet justo. Nunc non vestibulum felis. Sed quis nisi ut lorem vehicula pulvinar. Nulla convallis at mauris vitae tempor. Nulla fermentum arcu quis augue fringilla, luctus pulvinar urna lobortis. Aliquam in odio porttitor, eleifend ligula in, tincidunt neque.'
            );

            expect(waitingJobs.length).toBe(2);
        });

        it('should not create with documents set not exist', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const response = await request(app.getHttpServer())
                .post('/documents')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    title: 'test title',
                    content: 'test content',
                    documentsSetCode: 'wrong',
                })
                .expect(404);
        });
    });

    describe('GET /documents/:code', () => {
        it('should returns document', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
                ['Document', 'documentsTest_1'],
                ['DocumentPart', 'documentsTest_1'],
            ]);

            const code = '481d9713ef6987c7';

            const response = await request(app.getHttpServer())
                .get('/documents/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                code: '481d9713ef6987c7',
                title: 'test title',
                content:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lectus dui, sodales eu rhoncus a, lacinia a purus. Sed pharetra leo eros, vel bibendum odio malesuada in. Sed eu massa sed sem dignissim cursus. Nam ligula nulla, euismod sed lacus sit amet, faucibus fringilla lectus. Duis at nunc elit. Etiam iaculis lectus massa, in pharetra est iaculis id. Aliquam ultrices blandit ex vitae scelerisque. Nullam sed fermentum lorem. Sed in viverra tellus, eleifend accumsan metus. Proin vel consectetur tortor, eget feugiat ligula. Proin imperdiet convallis sem, a tristique arcu pulvinar eu. Proin a felis convallis, pulvinar diam id, dictum justo. Morbi volutpat rutrum mauris, vel varius nisi varius vel. Fusce vitae mauris in enim efficitur convallis ac volutpat lectus. Morbi nec condimentum eros. Sed ut mattis tellus. Mauris consequat enim dolor, non fermentum leo bibendum et. Ut purus massa, sollicitudin at aliquet vel, porttitor non nulla. Curabitur accumsan est elit, vitae tempor dui iaculis quis. Nullam turpis nisl, lobortis vitae finibus eu, efficitur non massa. Sed consectetur, justo sit amet elementum pharetra, ipsum nibh auctor dolor, non aliquam lectus dui at arcu. Pellentesque blandit libero at porta interdum. Nullam in urna rhoncus nisi condimentum dictum ac in nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur suscipit at erat vel porttitor. Donec feugiat nulla in risus sodales, at fringilla ipsum dictum. Etiam elementum ullamcorper velit eget mollis. In in libero sed lorem placerat mollis. Integer pulvinar ornare sapien, ac ultricies ipsum placerat in. Vivamus in dolor eget odio aliquam viverra. Ut lacinia placerat libero eu viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec quis malesuada lacus. Mauris tortor tellus, lobortis id ligula vitae, mattis elementum ligula. Duis rutrum laoreet sollicitudin. Suspendisse vel sagittis enim. Phasellus sed sapien sit amet nunc dictum lobortis et eu felis. In eget risus et quam ullamcorper efficitur eu vel neque. Proin congue, ante quis pharetra congue, nunc libero vulputate neque, id venenatis felis diam a augue. Donec porta odio quam, id pellentesque velit finibus a. Sed at tristique enim. Nam luctus in mauris a malesuada. Cras pulvinar lacinia diam, et sollicitudin purus ultrices eu. Nunc iaculis diam eu risus tincidunt blandit. Nulla iaculis bibendum mattis. Nunc luctus risus semper suscipit fermentum. Phasellus eleifend lacus vitae eleifend eleifend. Vivamus ut dui semper, vestibulum sem eget, commodo leo. Fusce lorem metus, laoreet eu finibus a, efficitur quis justo. Aliquam nec dictum risus. Nam imperdiet hendrerit suscipit. Suspendisse lobortis nulla placerat turpis scelerisque, semper sodales sem bibendum. Donec at placerat nunc. Aliquam luctus fringilla urna, eget semper mi luctus sed. Phasellus eu blandit quam, eu convallis magna. Aliquam quis ex eu justo feugiat congue eu a leo. Mauris pharetra bibendum efficitur. Sed iaculis nec felis vel mattis. Donec egestas tellus vitae tincidunt tempor. Vivamus magna elit, pharetra et consequat id, molestie sit amet justo. Nunc non vestibulum felis. Sed quis nisi ut lorem vehicula pulvinar. Nulla convallis at mauris vitae tempor. Nulla fermentum arcu quis augue fringilla, luctus pulvinar urna lobortis. Aliquam in odio porttitor, eleifend ligula in, tincidunt neque.',
                status: 'CREATED',
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

    describe('PUT /documents/:code', () => {
        it('should update document', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['Document', 'documentsTest_1'],
                ['DocumentPart', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const waitingJobs: any[] = [];
            queueEvents.on('waiting', ({ jobId }) => {
                waitingJobs.push(jobId);
            });

            const code = '481d9713ef6987c7';

            const response = await request(app.getHttpServer())
                .put('/documents/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ title: 'new title', content: 'new content' })
                .expect(200);

            expect(response.body).toEqual({
                code: '481d9713ef6987c7',
                title: 'new title',
                content: 'new content',
                status: 'CREATED',
            });

            const updatedDocument = await prisma.document.findUnique({
                where: { code },
            });
            const removedDocumentPart1 = await prisma.documentPart.findUnique({
                where: { id: 1 },
            });
            const removedDocumentPart2 = await prisma.documentPart.findUnique({
                where: { id: 2 },
            });
            const createdDocumentPart = await prisma.documentPart.findUnique({
                where: { id: 3 },
            });

            expect(removedDocumentPart1).toBeNull();
            expect(removedDocumentPart2).toBeNull();

            expect(updatedDocument).toEqual(
                expect.objectContaining({
                    id: 1,
                    code: '481d9713ef6987c7',
                    title: 'new title',
                    content: 'new content',
                })
            );
            expect(createdDocumentPart).toEqual({
                id: 3,
                content: 'new content',
                documentId: 1,
                tokens: 3,
                status: 'CREATED',
            });

            expect(waitingJobs.length).toBe(1);
        });

        it('should not update wrong code', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['Document', 'documentsTest_1'],
                ['DocumentPart', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const code = 'wrong';

            await request(app.getHttpServer())
                .put('/documents/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .send({ title: 'new name' })
                .expect(404);
        });
    });

    describe('DELETE /documents/:code', () => {
        it('should delete document', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['Document', 'documentsTest_1'],
                ['DocumentPart', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const code = '481d9713ef6987c7';

            const response = await request(app.getHttpServer())
                .delete('/documents/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Document deleted successfully',
            });

            const deleteDocument = await prisma.documentsSet.findUnique({
                where: { code },
            });
            const removedDocumentPart1 = await prisma.documentPart.findUnique({
                where: { id: 1 },
            });
            const removedDocumentPart2 = await prisma.documentPart.findUnique({
                where: { id: 2 },
            });

            expect(deleteDocument).toEqual(null);

            expect(removedDocumentPart1).toBeNull();
            expect(removedDocumentPart2).toBeNull();
        });

        it('should not delete wrong code', async () => {
            await insertDatasets([
                ['User', 'documentsTest_1'],
                ['Document', 'documentsTest_1'],
                ['DocumentPart', 'documentsTest_1'],
                ['DocumentsSet', 'documentsTest_1'],
            ]);

            const code = 'wrong';

            await request(app.getHttpServer())
                .delete('/documents/' + code)
                .set('Authorization', `Bearer ${access_token}`)
                .expect(404);
        });
    });
});
