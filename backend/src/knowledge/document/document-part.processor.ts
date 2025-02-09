// document-part.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Document, DocumentPartStatus, DocumentStatus } from '@prisma/client';
import { OpenAIService } from 'src/openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bullmq';
import { DocumentStatusGateway } from 'src/knowledge/document/document-status.gateway';

@Processor('document-queue')
export class DocumentPartProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        @Inject(OpenAIService)
        private readonly openAIService: OpenAIService,
        private readonly documentStatusGateway: DocumentStatusGateway
    ) {
        super();
    }

    async process(job: Job<{ documentId: number; partId: number }>) {
        const { documentId, partId } = job.data;

        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return { result: 'ERROR' };
        }

        if (document.status !== 'PROCESSING') {
            await this.setDocumentStatus(document, 'PROCESSING');
        }

        const result = await this.processPart(partId);

        if (!result) {
            await this.setDocumentStatus(document, 'FAILED');
            return { result: 'ERROR' };
        }

        const allPartsDone = await this.checkAllPartsDone(documentId);

        if (allPartsDone) {
            await this.setDocumentStatus(document, 'READY');
        }

        return { result: 'OK' };
    }

    private async processPart(partId: number): Promise<boolean> {
        const part = await this.prisma.documentPart.findUnique({
            where: { id: partId },
        });

        if (!part) {
            return false;
        }

        await this.setDocumentPartStatus(partId, 'PROCESSING');

        const embeddings = await this.openAIService.getEmbedding(part.content);

        if (!embeddings) {
            await this.setDocumentPartStatus(partId, 'FAILED');
            return false;
        }

        const partEmbedding = await this.prisma.documentPartEmbedding.create({
            data: {
                documentPartId: part.id,
                vector: embeddings,
            },
        });

        if (!partEmbedding) {
            await this.setDocumentPartStatus(partId, 'FAILED');
            return false;
        }

        await this.setDocumentPartStatus(partId, 'READY');

        return true;
    }

    private async setDocumentStatus(
        document: Document,
        status: DocumentStatus
    ) {
        const updatedDocument = await this.prisma.document.update({
            where: { id: document.id },
            data: { status },
        });

        this.documentStatusGateway.sendStatusUpdate(
            document.code,
            status,
            document.userId
        );

        return updatedDocument;
    }

    private async setDocumentPartStatus(
        partId: number,
        status: DocumentPartStatus
    ) {
        await this.prisma.documentPart.update({
            where: { id: partId },
            data: { status },
        });
    }

    private async checkAllPartsDone(documentId: number): Promise<boolean> {
        const parts = await this.prisma.documentPart.findMany({
            where: { documentId },
        });

        return parts.every((part) => part.status === 'READY');
    }
}
