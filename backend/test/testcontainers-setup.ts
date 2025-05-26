import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { execSync } from 'child_process'

let postgresContainer: StartedPostgreSqlContainer

async function setup() {
  console.log('Starting PostgreSQL testcontainers...')
  postgresContainer = await new PostgreSqlContainer('postgres:16.2-bookworm')
    .withDatabase('librariandb')
    .withUsername('postgres')
    .withPassword('mysecretpassword')
    .start()

  const databaseUrl = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}@${postgresContainer.getHost()}:${postgresContainer.getPort()}/${postgresContainer.getDatabase()}`
  console.log(`PostgreSQL testcontainers started at ${databaseUrl}`)
  process.env.DATABASE_URL = databaseUrl // 環境変数に設定

  console.log('Running Prisma migrate...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  console.log('Running Prisma seed...')
  execSync('npx prisma db seed', { stdio: 'inherit' })

  console.log('PostgreSQL testcontainers started and seeded.')
}

async function teardown() {
  console.log('Stopping PostgreSQL testcontainers...')
  if (postgresContainer) {
    await postgresContainer.stop()
  }
  console.log('PostgreSQL testcontainers stopped.')
}

export { setup, teardown }
