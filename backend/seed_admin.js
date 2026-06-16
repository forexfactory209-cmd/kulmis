const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedAdmin() {
  console.log("Starting administrative seed...");
  
  // 1. Create or verify default Admin
  const adminEmail = 'admin@somlance.com';
  const existingAdmin = await prisma.user.findFirst({ where: { email: adminEmail } });
  
  let adminUser;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('adminpassword123', 12);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: 'Somlance',
        lastName: 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true,
        status: 'ACTIVE'
      }
    });
    console.log("Created Admin User: admin@somlance.com / adminpassword123");
  } else {
    adminUser = existingAdmin;
    console.log("Admin User already exists.");
  }

  // 2. Fetch or create freelancers/clients to support transactions, projects and disputes
  let client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  let freelancer = await prisma.user.findFirst({ where: { role: 'FREELANCER' } });

  if (!client) {
    const hashedPassword = await bcrypt.hash('client123', 12);
    client = await prisma.user.create({
      data: {
        email: 'client@somlance.com',
        password: hashedPassword,
        role: 'CLIENT',
        firstName: 'Hassan',
        lastName: 'Corp',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true,
        clientProfile: { create: { companyName: 'Hassan Corp', website: 'https://hassan.com' } }
      }
    });
    console.log("Created Client User: client@somlance.com");
  }

  if (!freelancer) {
    const hashedPassword = await bcrypt.hash('freelancer123', 12);
    freelancer = await prisma.user.create({
      data: {
        email: 'freelancer@somlance.com',
        password: hashedPassword,
        role: 'FREELANCER',
        firstName: 'Ahmed',
        lastName: 'Ibrahim',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true,
        freelancerProfile: {
          create: {
            title: 'UI/UX Designer',
            bio: 'Creative designer with 5+ years experience building brand designs.',
            hourlyRate: 45.00,
            availability: 'FULL_TIME'
          }
        }
      }
    });
    console.log("Created Freelancer User: freelancer@somlance.com");
  }

  const freelancerProfile = await prisma.freelancerProfile.findFirst({ where: { userId: freelancer.id } });

  // 3. Create mock skills if none exist
  const skillNames = ['UI/UX Design', 'Graphic Design', 'Video Editing', 'Social Media', 'Writing'];
  for (const name of skillNames) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // Associate freelancer Ahmed with UI/UX Design skill
  if (freelancerProfile) {
    await prisma.freelancerProfile.update({
      where: { id: freelancerProfile.id },
      data: {
        skills: {
          connect: { name: 'UI/UX Design' }
        }
      }
    });
  }

  // 4. Create mock projects
  const countProjects = await prisma.project.count();
  if (countProjects < 3) {
    const projectsToCreate = [
      {
        title: 'Website UI Design',
        description: 'Need a stunning landing page design for our SaaS platform.',
        budget: 150.00,
        status: 'IN_PROGRESS',
        category: 'UI/UX Design'
      },
      {
        title: 'Social Media Management',
        description: 'Manage our Instagram and LinkedIn pages for a month.',
        budget: 300.00,
        status: 'IN_PROGRESS',
        category: 'Social Media'
      },
      {
        title: 'Video Editing Project',
        description: 'Edit a 10-minute promo video for our corporate event.',
        budget: 300.00,
        status: 'COMPLETED',
        category: 'Video Editing'
      },
      {
        title: 'Logo & Branding',
        description: 'Design a clean logo and define brand guidelines.',
        budget: 120.00,
        status: 'COMPLETED',
        category: 'Graphic Design'
      },
      {
        title: 'Translation Project',
        description: 'Translate our user manual from English to Somali.',
        budget: 80.00,
        status: 'OPEN',
        category: 'Writing'
      }
    ];

    for (const p of projectsToCreate) {
      await prisma.project.create({
        data: {
          clientId: client.id,
          title: p.title,
          description: p.description,
          budget: p.budget,
          status: p.status,
          category: p.category
        }
      });
    }
    console.log("Mock projects created.");
  }

  // 5. Create mock transactions
  const countTransactions = await prisma.transaction.count();
  if (countTransactions < 5) {
    const transactionsToCreate = [
      {
        userId: client.id,
        amount: 150.00,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        reference: 'DEP-1001'
      },
      {
        userId: freelancer.id,
        amount: 142.50,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        reference: 'WTH-2001'
      },
      {
        userId: client.id,
        amount: 7.50,
        type: 'PAYMENT',
        status: 'COMPLETED',
        reference: 'PLAT-1087'
      },
      {
        userId: client.id,
        amount: 300.00,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        reference: 'DEP-1002'
      },
      {
        userId: freelancer.id,
        amount: 120.00,
        type: 'PAYMENT',
        status: 'PENDING',
        reference: 'PAY-3001'
      }
    ];

    for (const tx of transactionsToCreate) {
      await prisma.transaction.create({
        data: {
          userId: tx.userId,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          reference: tx.reference
        }
      });
    }
    console.log("Mock transactions created.");
  }

  // 6. Create mock disputes
  const countDisputes = await prisma.dispute.count();
  if (countDisputes === 0) {
    const inProgressProject = await prisma.project.findFirst({ where: { status: 'IN_PROGRESS' } });
    if (inProgressProject) {
      await prisma.dispute.create({
        data: {
          projectId: inProgressProject.id,
          initiatorId: client.id,
          reason: 'Freelancer is late on deliverables and did not communicate for 5 days.',
          status: 'PENDING'
        }
      });
      console.log("Mock dispute created.");
    }
  }

  console.log("Administrative Seeding complete successfully!");
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
