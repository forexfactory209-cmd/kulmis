import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
      where: { email: 'admin@somlance.com' },
      update: {
        password: passwordHash,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@somlance.com',
        password: passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('✅ Admin user created: admin@somlance.com (password: password123)');

    // 2. Create Business Client User
    const client = await prisma.user.upsert({
      where: { email: 'client@company.com' },
      update: {
        password: passwordHash,
        role: 'CLIENT',
      },
      create: {
        email: 'client@company.com',
        password: passwordHash,
        firstName: 'John',
        lastName: 'Business',
        role: 'CLIENT',
        isVerified: true,
        businessProfile: {
          create: {
            companyName: 'Acme Corp',
            industry: 'Technology',
          },
        },
      },
    });
    console.log('✅ Business client created: client@company.com (password: password123)');

    // 3. Create a Freelancer User (for testing chat/projects)
    const freelancer = await prisma.user.upsert({
      where: { email: 'freelancer@somlance.com' },
      update: {
        password: passwordHash,
        role: 'FREELANCER',
      },
      create: {
        email: 'freelancer@somlance.com',
        password: passwordHash,
        firstName: 'Jane',
        lastName: 'Developer',
        role: 'FREELANCER',
        isVerified: true,
        freelancerProfile: {
          create: {
            title: 'Senior Full Stack Developer',
            bio: 'I build awesome web applications.',
            hourlyRate: 50,
            availability: 'FULL_TIME',
            skills: {
              connectOrCreate: [
                {
                  where: { name: 'React' },
                  create: { name: 'React' },
                },
                {
                  where: { name: 'Node.js' },
                  create: { name: 'Node.js' },
                }
              ]
            }
          }
        }
      },
    });
    console.log('✅ Freelancer created: freelancer@somlance.com (password: password123)');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
