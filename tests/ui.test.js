import { test, expect } from '@playwright/test';

test.describe('Claude Code UI Browser Tests', () => {
  test('Homepage should load and show login/setup form', async ({ page }) => {
    await page.goto('/');
    
    // Should have the title
    await expect(page).toHaveTitle(/Claude Code UI/);
    
    // Should show either login form or setup form
    const hasSetupForm = await page.locator('text=Setup').isVisible();
    const hasLoginForm = await page.locator('text=Login').isVisible();
    
    expect(hasSetupForm || hasLoginForm).toBeTruthy();
  });

  test('Should be able to register/login and access main interface', async ({ page }) => {
    await page.goto('/');
    
    // Check if we need setup or login
    const needsSetup = await page.locator('text=Setup').isVisible();
    
    if (needsSetup) {
      // Fill setup form
      await page.fill('input[type="text"]', 'testuser3');
      await page.fill('input[type="password"]', 'testpass123');
      await page.click('button[type="submit"]');
    } else {
      // Fill login form
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpass123');
      await page.click('button[type="submit"]');
    }
    
    // Should redirect to main interface
    await expect(page.locator('text=New Session')).toBeVisible({ timeout: 10000 });
  });
});