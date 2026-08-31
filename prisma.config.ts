import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL') // use your direct (non-pooled) URL here for migrations
  },
  migrations: {
    path: 'prisma/migrations'
  }
})
