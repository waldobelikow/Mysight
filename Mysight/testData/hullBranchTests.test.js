const { test, expect } = require('@playwright/test');
const { createBrowserContext, closeBrowser } = require('./testUtils');
const fs = require('fs');
const path = require('path');

// Load test data
const testData = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData.json')));

let browser;
let page;

// Set up browser and page before all tests
test.beforeAll(async () => {
  ({ browser, page } = await createBrowserContext());
});

// Cleanup after all tests
test.afterAll(async () => {
  await closeBrowser(browser);
});

// Test: Select Hull branch and verify the address
test('Select Hull branch and verify address', async () => {
  await test.step('Click the "Hull" button and wait for the address to appear', async () => {
    await page.getByRole('button', { name: 'Hull' }).click();
    await page.locator(`text=${testData.hullBranch.address}`).waitFor({ state: 'visible' });
  });

  await test.step('Verify the address is correct', async () => {
    const addressElement = page.locator(`text=${testData.hullBranch.address}`);
    await expect(addressElement).toBeVisible();
    await expect(addressElement).toHaveText(testData.hullBranch.address);
  });
});

// Test: Verify the opening times for Hull on Wednesday
test('Verify the opening times for Hull on Wednesday', async () => {
  let currentDay;

  await test.step('Determine the current day of the week', async () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    currentDay = daysOfWeek[new Date().getDay()];
  });

  await test.step('Select the current day button and open the dropdown if necessary', async () => {
    const dayButton = page.getByRole('button', { name: new RegExp(currentDay, 'i') });
    const dayMenu = page.locator(`[data-test-id="branch_details_opening_day_${currentDay.toLowerCase()}"]`).first();

    if (!(await dayMenu.isVisible())) {
      await dayButton.click();
    }
    await dayMenu.waitFor({ state: 'visible' });
  });

  await test.step('Verify the opening hours for Wednesday match the data', async () => {
    const openingHoursLocator = page.locator('[data-test-id="branch_details_opening_time_wednesday"]').first();
    await expect(openingHoursLocator).toHaveText(testData.hullBranch.openingHours.wednesday);
  });
});

// Test: Verify no available appointments and disabled buttons
test('Verify no available appointments and buttons are disabled', async () => {
  await test.step('Click "Book Online" and check if the "Next" button is disabled', async () => {
    await page.getByRole('button', { name: 'Book Online' }).click();

    const nextButton = page.locator('[data-test-id="next_button"]');
    expect(await nextButton.isDisabled()).toBe(true, 'The "Next" button should be disabled!');
  });
});
