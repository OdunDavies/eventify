import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
try {
  const result = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'Event' AND column_name IN ($1, $2)",
    'contactEmail',
    'organizerToken'
  )
  console.log(JSON.stringify(result))
} catch (e) {
  console.error(e.message)
}
await p.$disconnect()
