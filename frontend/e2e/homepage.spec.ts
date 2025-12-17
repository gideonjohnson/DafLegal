import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/DafLegal/);

    // Check main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have CTA buttons', async ({ page }) => {
    await page.goto('/');

    // Look for common CTA text
    const ctaPattern = /start.*free.*trial|sign.*up|get.*started/i;
    const ctas = page.getByRole('button').or(page.getByRole('link')).filter({ hasText: ctaPattern });

    // Should have at least one CTA
    await expect(ctas.first()).toBeVisible();
  });

  test('should navigate to features section', async ({ page }) => {
    await page.goto('/');

    // Click features link if it exists
    const featuresLink = page.getByRole('link', { name: /features/i });
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      await page.waitForURL(/.*#features.*/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should load without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test('should have accessible images', async ({ page }) => {
    await page.goto('/');

    // All images should have alt text
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');

    // Look for dark mode toggle
    const darkModeToggle = page.getByRole('button', { name: /dark|light|theme/i });

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();

      // Wait for theme change (check html or body class)
      await page.waitForTimeout(500);

      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toMatch(/dark|light/);
    }
  });
});
