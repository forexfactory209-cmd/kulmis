const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function test() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    console.log('User found:', user.email);

    const isValid = await bcrypt.compare('password123', user.password);
    console.log('Password valid:', isValid);

    if (isValid) {
      const hashed = await bcrypt.hash('password456', 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed }
      });
      console.log('Password updated successfully');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
