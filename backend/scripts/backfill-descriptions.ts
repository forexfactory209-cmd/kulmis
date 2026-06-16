import { prisma } from '../src/lib/prisma';

async function backfill() {
  console.log('Starting backfill for ProjectActivity descriptions...');

  // 1. Revisions
  const revisionActivities = await prisma.projectActivity.findMany({
    where: {
      content: { startsWith: 'Revision requested on milestone:' },
      OR: [
        { description: null },
        { description: 'No description provided.' }
      ]
    }
  });

  for (const act of revisionActivities) {
    const stepNameMatch = act.content.match(/milestone:\s*(.*)$/);
    if (stepNameMatch && stepNameMatch[1]) {
      const stepName = stepNameMatch[1];
      
      const revision = await prisma.projectStepRevision.findFirst({
        where: {
          step: {
            projectId: act.projectId,
            name: stepName
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (revision) {
        await prisma.projectActivity.update({
          where: { id: act.id },
          data: { description: revision.content }
        });
        console.log(`Updated revision description for ${act.id}`);
      }
    }
  }

  // 2. Submissions
  const submitActivities = await prisma.projectActivity.findMany({
    where: {
      content: { startsWith: 'Milestone submitted for review:' },
      OR: [
        { description: null },
        { description: 'No description provided.' }
      ]
    }
  });

  for (const act of submitActivities) {
    const stepNameMatch = act.content.match(/review:\s*(.*)$/);
    if (stepNameMatch && stepNameMatch[1]) {
      const stepName = stepNameMatch[1];
      
      const step = await prisma.projectProgressStep.findFirst({
        where: {
          projectId: act.projectId,
          name: stepName
        }
      });

      if (step && step.submissionMsg) {
        await prisma.projectActivity.update({
          where: { id: act.id },
          data: { description: step.submissionMsg }
        });
        console.log(`Updated submission description for ${act.id}`);
      }
    }
  }

  console.log('Backfill complete!');
}

backfill()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
