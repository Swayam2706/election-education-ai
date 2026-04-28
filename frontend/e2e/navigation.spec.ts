import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Learn');
    await expect(page).toHaveURL(/learn/);
    
    await page.click('text=Quiz');
    await expect(page).toHaveURL(/quiz/);
    
    await page.click('text=Timeline');
    await expect(page).toHaveURL(/timeline/);
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    const links = nav.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(3);
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await expect(page).not.toHaveURL('/');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('nav')).toBeVisible();
  });
});
