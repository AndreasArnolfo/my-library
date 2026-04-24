import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  const prisma = new PrismaClient({ adapter })
  const data = await prisma.snippet.findMany()
  console.log(data)
  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
