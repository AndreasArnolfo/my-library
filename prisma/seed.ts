import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
  console.log('Seed: nothing to do (snippets are created via the UI).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
