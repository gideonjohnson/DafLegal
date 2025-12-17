import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check that h1 exists
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Count heading levels
    const h1Count = await page.getByRole('heading', { level: 1 }).count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    // Check if skip link is focused
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const tagName = await focusedElement.evaluate(el => el?.tagName.toLowerCase());

    // Skip link is usually an anchor
    expect(tagName).toBe('a');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through first 5 focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');

      // Verify something is focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // This is a basic check - for comprehensive contrast checking, use axe-playwright
    // Here we just verify text is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify some text elements are visible (proxy for contrast)
    const paragraphs = await page.locator('p').all();
    if (paragraphs.length > 0) {
      await expect(paragraphs[0]).toBeVisible();
    }
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Get all buttons
    const buttons = await page.getByRole('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // Button should have either text content or aria-label
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.getByRole('main');
    await expect(main).toBeVisible({ timeout: 5000 });

    // Check for navigation landmark
    const nav = page.getByRole('navigation');
    await expect(nav.first()).toBeVisible();
  });
});
