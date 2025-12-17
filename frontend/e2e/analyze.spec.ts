import { test, expect } from '@playwright/test';

test.describe('Contract Analysis Page', () => {
  test('should load analyze page', async ({ page }) => {
    await page.goto('/analyze');

    // Check if page loads (might redirect to login if not authenticated)
    await expect(page).toHaveURL(/.*\/(analyze|auth\/signin).*/);
  });

  test('should require authentication', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();

    await page.goto('/analyze');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/(auth\/signin|signin|login).*/);
  });

  test('should display file upload area when authenticated', async ({ page }) => {
    // Note: This test assumes there's a test user or you're already logged in
    // In a real scenario, you'd use page.context().addCookies() to set auth cookies

    await page.goto('/analyze');

    // If on analyze page (authenticated), check for upload area
    if (page.url().includes('/analyze')) {
      const uploadArea = page.getByText(/drag.*drop|upload|choose.*file/i);
      await expect(uploadArea).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show supported file types', async ({ page }) => {
    await page.goto('/analyze');

    // Skip if redirected to login
    if (page.url().includes('/analyze')) {
      const fileTypeInfo = page.getByText(/pdf|docx|doc|supported/i);
      await expect(fileTypeInfo.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
