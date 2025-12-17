# Frontend E2E Tests with Playwright

End-to-end tests for DafLegal frontend using Playwright.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### All Tests

```bash
# Run all tests in headless mode
npm test

# Run tests with UI (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debugging

```bash
# Run tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test e2e/auth.spec.ts --debug

# Generate and open test report
npm run test:report
```

### Watch Mode

```bash
# Run tests in watch mode (reruns on file changes)
npx playwright test --ui
```

## Test Structure

```
e2e/
├── homepage.spec.ts         # Homepage tests
├── auth.spec.ts             # Authentication flow tests
├── analyze.spec.ts          # Contract analysis page tests
├── accessibility.spec.ts    # Accessibility tests
└── README.md               # This file
```

## Test Coverage

### Homepage (`homepage.spec.ts`)
- ✅ Page loads successfully
- ✅ Navigation menu displays
- ✅ CTA buttons present
- ✅ Features section navigation
- ✅ Mobile responsiveness
- ✅ Image accessibility (alt text)
- ✅ Dark mode toggle

### Authentication (`auth.spec.ts`)
- ✅ Sign up page navigation
- ✅ Sign up form display
- ✅ Email validation
- ✅ Sign in page navigation
- ✅ Sign in form display
- ✅ Invalid credentials handling
- ✅ Password visibility toggle

### Analysis (`analyze.spec.ts`)
- ✅ Page loads
- ✅ Authentication requirement
- ✅ File upload area (when authenticated)
- ✅ Supported file types display

### Accessibility (`accessibility.spec.ts`)
- ✅ Heading hierarchy
- ✅ Skip to content link
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ ARIA labels
- ✅ Screen reader support

## Configuration

Tests run in multiple browsers by default:
- Chrome (Desktop)
- Firefox (Desktop)
- Safari (Desktop)
- Chrome (Mobile - Pixel 5)
- Safari (Mobile - iPhone 12)

To run specific browsers:
```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
```

## Environment Variables

Set test environment in `.env.test`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production testing:
```bash
PLAYWRIGHT_BASE_URL=https://daflegal.com
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run tests
        run: |
          cd frontend
          npm test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Writing New Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');

    // Interact with page
    await page.click('button');

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use role selectors**: `page.getByRole('button', { name: 'Submit' })`
2. **Wait for elements**: `await expect(element).toBeVisible()`
3. **Test user flows**: Test complete scenarios, not just individual actions
4. **Use descriptive names**: Test names should describe what they verify
5. **Avoid hard waits**: Use `waitForSelector` instead of `waitForTimeout`
6. **Test across browsers**: Ensure tests pass in all configured browsers

## Common Patterns

### Authentication

```typescript
// Login helper
async function login(page, email, password) {
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

// Use in test
test('should access protected page', async ({ page }) => {
  await login(page, 'test@example.com', 'password123');
  await page.goto('/analyze');
  // Test protected functionality
});
```

### File Upload

```typescript
test('should upload file', async ({ page }) => {
  await page.goto('/analyze');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('path/to/test.pdf');

  await expect(page.getByText('File uploaded')).toBeVisible();
});
```

### Network Mocking

```typescript
test('should handle API error', async ({ page }) => {
  // Mock API error
  await page.route('**/api/v1/contracts/analyze', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' })
    });
  });

  await page.goto('/analyze');
  // Upload file
  // Verify error handling
});
```

## Visual Regression Testing

To add visual regression tests:

```bash
# Install snapshot plugin
npm install -D @playwright/test
```

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Performance Testing

```typescript
test('should load within 3 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);
});
```

## Troubleshooting

### Tests Failing Locally

1. Ensure dev server is running: `npm run dev`
2. Check if port 3000 is available
3. Clear browser cache: `npx playwright clean`

### Flaky Tests

1. Add explicit waits: `await page.waitForSelector()`
2. Increase timeout: `test.setTimeout(60000)`
3. Use retry: Configure in `playwright.config.ts`

### Browser Not Found

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
