import { chromium } from 'playwright';

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
