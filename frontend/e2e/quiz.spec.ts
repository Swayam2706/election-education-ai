import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display quiz list', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('h1')).toContainText('Quizzes');
    await expect(page.locator('.card')).toHaveCount(3, { timeout: 10000 });
  });

  test('should take a quiz', async ({ page }) => {
    await page.goto('/quiz');
    await page.click('.card:first-child a');
    
    await expect(page.locator('h1')).toContainText('Quiz');
    
    // Answer questions
    await page.click('input[type="radio"]:first-child');
    await page.click('button:has-text("Next")');
    
    await page.click('input[type="radio"]:first-child');
    await page.click('button:has-text("Submit")');
    
    // Check results
    await expect(page.locator('text=/Score:/i')).toBeVisible();
  });

  test('should filter quizzes by difficulty', async ({ page }) => {
    await page.goto('/quiz');
    await page.selectOption('select[name="difficulty"]', 'beginner');
    await expect(page.locator('.card')).toHaveCount(1, { timeout: 5000 });
  });

  test('should show quiz history', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=/Recent Quiz Attempts/i')).toBeVisible();
  });
});
