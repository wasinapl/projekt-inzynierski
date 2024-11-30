import { config } from 'dotenv'
import { execSync } from 'child_process'

config({ path: '.env.test' })

// Reset the test database before running tests
execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' })
