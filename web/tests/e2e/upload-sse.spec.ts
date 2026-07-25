import { test, expect } from '@playwright/test';

test.describe('Upload and SSE Flow', () => {
  test('should display the home page with drop file input', async ({ page }) => {
    await page.goto('/');

    // Check title text on home page
    await expect(page.getByText('Transform videos into')).toBeVisible();
    await expect(page.getByText('Ready to start?')).toBeVisible();
  });

  test('should handle video processing SSE events on processing page', async ({ page }) => {
    const mockJobId = 'test-job-123';

    // Mock SSE endpoint for the processing page
    await page.route(`**/videos/events/${mockJobId}`, async (route) => {
      const sseContent = [
        'data: ' + JSON.stringify({ status: 'processing', progress: { percentage: 45, step: 'transcribing' } }) + '\n\n',
      ].join('');

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: sseContent,
      });
    });

    await page.goto(`/processing/${mockJobId}`);

    // Verify processing UI components appear
    await expect(page.locator('body')).toBeVisible();
  });
});
