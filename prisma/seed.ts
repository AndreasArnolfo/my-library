import 'dotenv/config'
import prisma from '../lib/prisma'
import { SNIPPETS } from '../lib/snippets'

async function main() {
  console.log('Seeding database with mock snippets...')
  
  for (const snippet of SNIPPETS) {
    await prisma.snippet.create({
      data: {
        id: snippet.id, // we can keep the static IDs or omit them to let uuid() handle it, but keeping helps if they rely on it
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        category: snippet.category,
        tags: snippet.tags,
        code: snippet.code,
        createdAt: new Date(snippet.createdAt),
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
