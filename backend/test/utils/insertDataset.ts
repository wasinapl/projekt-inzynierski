import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

const TABLE_INSERT_ORDER = [
    'User',
    'DocumentsSet',
    'Document',
    'DocumentPart',
    'DocumentPartEmbedding',
    'ChatThread',
    'Message',
];

/**
 * Reads SQL from "datasets/{table}/{dataset}.sql"
 * executes all statements in the SQL.
 */
export const insertDataset = async (table: string, dataset: string) => {
    try {
        const filePath = path.join(
            __dirname,
            '..', // go up one level
            'datasets',
            table,
            `${dataset}.sql`
        );

        const fileContent = await fs.readFile(filePath, 'utf-8');

        const statements = fileContent
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

        for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
        }
    } catch (error) {
        console.error(
            `Error while inserting dataset '${dataset}' into table '${table}':`,
            error
        );
        throw error;
    }
};

export async function insertDatasets(
    datasets: Array<[table: string, dataset: string]>
) {
    const sorted = reorderDatasets(datasets);

    for (const [table, dataset] of sorted) {
        await insertDataset(table, dataset);
    }
}

function reorderDatasets(
    datasets: Array<[table: string, dataset: string]>
): Array<[table: string, dataset: string]> {
    const ordered: Array<[string, string]> = [];

    for (const table of TABLE_INSERT_ORDER) {
        const matches = datasets.filter(([t]) => t === table);

        ordered.push(...matches);
    }

    return ordered;
}
