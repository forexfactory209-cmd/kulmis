const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
  const cashka = await prisma.user.findFirst({where:{email:'cashka@gmail.com'}});
  const client = await prisma.user.findFirst({where:{email:'hamse@gmail.com'}});

  if (!cashka || !client) {
    console.log("Users not found");
    return;
  }

  // Create freelancer profile for Cashka if it doesn't exist
  let fp = await prisma.freelancerProfile.findUnique({where: {userId: cashka.id}});
  if (!fp) {
    fp = await prisma.freelancerProfile.create({
      data: {
        userId: cashka.id,
        title: 'Full Stack Developer',
        bio: 'I build amazing apps.',
        hourlyRate: 50,
        availability: 'FULL_TIME',
      }
    });
  }

  // Create a project for the client
  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      title: 'Mobile App Development',
      description: 'Need a developer to build a mobile app in React Native.',
      budget: 1500,
      status: 'IN_PROGRESS',
      category: 'Mobile Development'
    }
  });

  // Create a proposal
  const proposal = await prisma.proposal.create({
    data: {
      projectId: project.id,
      freelancerId: fp.id, // Fixed: use FreelancerProfile id
      coverLetter: 'I would love to work on this!',
      bidAmount: 1500,
      status: 'ACCEPTED'
    }
  });

  // Create an escrow (active job)
  const escrow = await prisma.escrowPayment.create({
    data: {
      projectId: project.id,
      amount: 1500,
      status: 'HELD'
    }
  });

  // Create a message conversation
  const conv = await prisma.conversation.create({
    data: {
      users: {
        create: [
          { userId: cashka.id },
          { userId: client.id }
        ]
      }
    }
  });

  await prisma.message.create({
    data: {
      content: 'Hello, looking forward to working with you!',
      senderId: cashka.id,
      conversationId: conv.id
    }
  });
  
  await prisma.message.create({
    data: {
      content: 'Me too, let us start immediately.',
      senderId: client.id,
      conversationId: conv.id
    }
  });

  console.log("Seeding complete!");
}

seedData().catch(console.error);
