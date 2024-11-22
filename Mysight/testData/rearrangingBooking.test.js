const { test, expect } = require('@playwright/test');
const { createBrowserContext, closeBrowser, selectNextValidDay, login } = require('./testUtils');
const fs = require('fs');
const path = require('path');

// Load the test data
const testData = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData.json')));

let browser;
let page;

// Set up the browser and page before all tests
test.beforeAll(async () => {
  ({ browser, page } = await createBrowserContext());
});

// Clean up after all tests
test.afterAll(async () => {
  await closeBrowser(browser);
});

// Test login functionality
test('login', async () => {
  await login(page, testData.user.email, testData.user.password);
});

// Test rearranging a booking
test('rearranging booking', async () => {
  await test.step('Click the "Details" button for the first entry', async () => {
    await page.locator('[data-test-id="account_dashboard_appointment_card_details_button_0"]').click();
  });

  await test.step('Wait until the "Rearrange" button is visible and click it', async () => {
    const rearrangeButton = page.locator('[data-test-id="account_appointments_booked_details_rearrange_button"]');
    await expect(rearrangeButton).toBeVisible();
    await rearrangeButton.click();
  });

  // Ensure date and time selection
  await test.step('Verify the "Select date and time" label is visible', async () => {
    const selectDateAndTimeLabel = page.locator('[data-test-id="date_time_choose_date_time_text"]');
    await expect(selectDateAndTimeLabel).toBeVisible();
  });

  await test.step('Select the next valid day, skipping Sunday and Monday', async () => {
    // Get the selector for the next valid day using the helper function
    const nextDaySelector = await selectNextValidDay(page);

    // Click the button corresponding to the next valid day
    await page.locator(nextDaySelector).click();
  });

  await test.step('Select the first available time slot', async () => {
    await page.locator('[data-test-id="choose_appointment_appointment_slot_button_0"]').click();
  });

  await test.step('Click the "Book now" button', async () => {
    await page.getByRole('button', { name: 'Book now' }).click();
  });

  await test.step('Verify that the booking has been successfully rearranged', async () => {
    const confirmationText = page.locator('[data-test-id="header_progress_indicator_current_step_text"]');
    await expect(confirmationText).toContainText('Your appointment has been rearranged');
  });
});
