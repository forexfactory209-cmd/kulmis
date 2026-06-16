const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function test() {
  try {
    const hashed = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testcp@somlance.com',
        password: hashed,
        firstName: 'Test',
        lastName: 'CP',
        role: 'CLIENT'
      }
    });

    console.log('Created user');
    
    // Login
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testcp@somlance.com', password: 'password123' })
    });
    const login = await loginRes.json();
    console.log('Login token:', login.data?.accessToken?.substring(0, 10));

    // Change Password
    const cpRes = await fetch('http://localhost:5000/api/v1/users/settings/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.accessToken}`
      },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'password456' })
    });
    const cp = await cpRes.json();
    console.log('CP response:', cp);

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
