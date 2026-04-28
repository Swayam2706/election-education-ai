import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should send and receive messages', async ({ page }) => {
    await page.goto('/chat');
    
    const input = page.locator('textarea[aria-label="Chat message input"]');
    await input.fill('How do I register to vote?');
    await page.click('button[aria-label="Send message"]');
    
    await expect(page.locator('text=/How do I register to vote?/i')).toBeVisible();
    await expect(page.locator('.animate-bounce')).toBeVisible();
    
    await expect(page.locator('text=/register/i').nth(1)).toBeVisible({ timeout: 15000 });
  });

  test('should use suggested questions', async ({ page }) => {
    await page.goto('/chat');
    
    await page.click('button:has-text("How do I register to vote?")');
    
    const input = page.locator('textarea[aria-label="Chat message input"]');
    await expect(input).toHaveValue('How do I register to vote?');
  });

  test('should start new chat', async ({ page }) => {
    await page.goto('/chat');
    
    const input = page.locator('textarea[aria-label="Chat message input"]');
    await input.fill('Test message');
    await page.click('button[aria-label="Send message"]');
    
    await page.click('button:has-text("New Chat")');
    
    await expect(page.locator('text=/Welcome to Election Education Chat/i')).toBeVisible();
  });

  test('should clear chat', async ({ page }) => {
    await page.goto('/chat');
    
    const input = page.locator('textarea[aria-label="Chat message input"]');
    await input.fill('Test message');
    await page.click('button[aria-label="Send message"]');
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Clear")');
    
    await expect(page.locator('text=/Welcome to Election Education Chat/i')).toBeVisible();
  });
});
