import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Mapping of table names to Prisma models.
 * Extend this mapping based on your Prisma schema.
 */
const tableToModelMap: { [key: string]: keyof PrismaClient } = {
    user: 'user',
    documentsSet: 'documentsSet',
};

/**
 * Inserts a dataset into a specified table using Prisma's Client API.
 *
 * @param table - The name of the table (as defined in tableToModelMap).
 * @param dataset - The name of the dataset file (without extension).
 */
export const insertDataset = async (table: string, dataset: string) => {
    const model = tableToModelMap[table];

    if (!model) {
        throw new Error(
            `Model for table "${table}" is not defined in tableToModelMap.`
        );
    }

    const filePath = path.join(
        __dirname,
        '..',
        'datasets',
        table,
        `${dataset}.json`
    );

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Dataset file not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (!Array.isArray(data)) {
            throw new Error(
                `Dataset file must contain a JSON array: ${filePath}`
            );
        }

        // Type assertion to handle dynamic model names
        // This assumes that the data shape matches the Prisma model
        await (prisma as any)[model].createMany({
            data,
            skipDuplicates: true, // Optional: skip inserting duplicates based on unique constraints
        });

        // console.log(`Dataset "${dataset}" inserted into "${table}" successfully.`)
    } catch (error) {
        console.error(
            `Error inserting dataset "${dataset}" into "${table}":`,
            error
        );
        throw error;
    }
};
