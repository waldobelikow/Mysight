const { test, expect } = require('@playwright/test');
const { createBrowserContext, closeBrowser, login } = require('./testUtils');
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

// Test updating account details
test('update account details', async () => {
  const firstNameUpdate = "TestUserUpdate";

  await test.step('Click the "Edit Account Details" icon', async () => {
    await page.getByLabel('Edit Account Details').click();
  });

  await test.step('Fill in "TestUserUpdate" in the "First Name" field', async () => {
    const firstNameLocator = page.locator('[data-test-id="update_details_first_name_input"]');
    await firstNameLocator.waitFor({ state: 'visible' });
    await firstNameLocator.fill(firstNameUpdate);
  });

  await test.step('Click the "Update" button', async () => {
    await page.locator('[data-test-id="update_details_update_button"]').click();
  });

  await test.step('Enter the password in the "Password" field and click "Save Changes"', async () => {
    const passwordLocator = page.locator('[data-test-id="password_input_not_recognised_password_text"]');
    await passwordLocator.waitFor({ state: 'visible' });

    // Fill the password
    await passwordLocator.fill(testData.user.password);

    // Wait for 1 second for stability
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Click the "Save Changes" button
    await page.getByRole('button', { name: 'Save Changes' }).click();
  });

  await test.step('Verify the confirmation message "We\'ve saved your updated details"', async () => {
    await expect(page.getByRole('main')).toContainText("We've saved your updated details");
  });

  await test.step('Verify the updated name on the dashboard', async () => {
    // Navigate to the dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // Check the name displayed on the dashboard
    const welcomeMessageLocator = page.locator('[data-test-id="account_header_message_text"]');
    await welcomeMessageLocator.waitFor({ state: 'visible' });

    await expect(welcomeMessageLocator).toContainText(`Welcome back ${firstNameUpdate}`);
  });
});
