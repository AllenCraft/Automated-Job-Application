import { chromium } from 'playwright';
import prisma from '../prisma';
import { generateCoverLetter, optimizeResume } from './aiService';

export interface ApplicationProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumePath?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
}

export async function prepareApplicationReview(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  const profile = await prisma.candidateProfile.findFirst();

  if (!job || !profile) {
    throw new Error('Job or profile not found');
  }

  const parsedResume = profile.parsedResume ? JSON.parse(profile.parsedResume) : null;

  const coverLetter = await generateCoverLetter(parsedResume, job.description);
  const optimizedCv = await optimizeResume(parsedResume, job.description);

  return await prisma.application.create({
    data: {
      userId: profile.userId,
      jobId: job.id,
      status: 'pending_review',
      coverLetter,
      optimizedCv: JSON.stringify(optimizedCv),
    },
    include: { job: true }
  });
}

export async function submitApplication(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, user: { include: { candidateProfile: true } } }
  });

  if (!application) throw new Error('Application not found');
  if (application.status !== 'approved') throw new Error('Application must be approved before submission');

  const profile = application.user.candidateProfile;
  const parsedResume = profile?.parsedResume ? JSON.parse(profile.parsedResume) : {};

  const appProfile: ApplicationProfile = {
    firstName: parsedResume.name?.split(' ')[0] || application.user.name?.split(' ')[0] || 'John',
    lastName: parsedResume.name?.split(' ').slice(1).join(' ') || application.user.name?.split(' ').slice(1).join(' ') || 'Doe',
    email: application.user.email,
    phone: profile?.timezone || '0000000000',
  };

  const result = await applyToGreenhouse(application.job.applyUrl, appProfile, false);

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: result.success ? 'submitted' : 'failed',
      logs: result.message,
    }
  });

  return result;
}

export async function applyToGreenhouse(jobUrl: string, profile: ApplicationProfile, dryRun: boolean = true) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(jobUrl);
    await page.waitForSelector('#first_name', { timeout: 10000 });
    await page.fill('#first_name', profile.firstName);
    await page.fill('#last_name', profile.lastName);
    await page.fill('#email', profile.email);
    await page.fill('#phone', profile.phone);
    if (dryRun) return { success: true, message: 'Dry run completed.' };
    return { success: true, message: 'Application submitted (simulated).' };
  } catch (error: any) {
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}
