
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const usersCount = await prisma.user.count();
    console.log('Total users:', usersCount);
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
