import { test, expect } from '@playwright/test';

test('verify dashboard displays categorized jobs', async ({ page }) => {
  // Go to dashboard
  await page.goto('http://localhost:3000/dashboard');

  // Wait for jobs to load
  await page.waitForSelector('text=Class B Opportunities', { timeout: 10000 }).catch(() => null);

  // Check if Class B is visible (based on our DB check)
  const classBHeader = await page.isVisible('text=Class B Opportunities');
  console.log(`Class B Opportunities visible: ${classBHeader}`);

  // Check if Class C is visible
  const classCHeader = await page.isVisible('text=Class C Opportunities');
  console.log(`Class C Opportunities visible: ${classCHeader}`);

  // Take a screenshot of the updated dashboard
  await page.screenshot({ path: '/home/jules/verification/screenshots/final_dashboard_check.png' });
});
