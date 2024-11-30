import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

export default async () => {
    dotenv.config({ path: '.env.test' });

    try {
        await execAsync('npx prisma migrate reset --force --skip-seed');
        console.log('\n Database reset successfully.');
    } catch (error) {
        console.error('Error resetting database:', error);
    }
};
