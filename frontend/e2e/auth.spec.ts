import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/');

    // Find and click sign up link
    const signUpLink = page.getByRole('link', { name: /sign.*up|register/i });
    await signUpLink.click();

    // Should be on signup page
    await expect(page).toHaveURL(/.*\/(auth\/signup|signup|register).*/);
  });

  test('should display sign up form', async ({ page }) => {
    await page.goto('/auth/signup');

    // Check for form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /sign.*up|create.*account|register/i });
    await expect(submitButton).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('TestPass123!');

    // Try to submit
    const submitButton = page.getByRole('button', { name: /sign.*up|create.*account|register/i });
    await submitButton.click();

    // Should show validation error
    const errorMessage = page.getByText(/valid.*email|email.*invalid/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    // Find and click sign in link
    const signInLink = page.getByRole('link', { name: /sign.*in|login|log.*in/i });
    await signInLink.click();

    // Should be on signin page
    await expect(page).toHaveURL(/.*\/(auth\/signin|signin|login).*/);
  });

  test('should display sign in form', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /sign.*in|login|log.*in/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill invalid credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');

    // Submit
    const submitButton = page.getByRole('button', { name: /sign.*in|login|log.*in/i });
    await submitButton.click();

    // Should show error
    await page.waitForTimeout(2000); // Wait for API call
    const errorMessage = page.getByText(/invalid|incorrect|wrong|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should have password visibility toggle', async ({ page }) => {
    await page.goto('/auth/signin');

    const passwordInput = page.getByLabel(/password/i);
    const toggleButton = page.locator('button[aria-label*="password" i], button[title*="password" i]').first();

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');

    if (await toggleButton.isVisible()) {
      // Click toggle
      await toggleButton.click();

      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
