const { chromium, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const config = require('../playwright.config'); // Import the configuration

// Load the JSON file with test data
const testData = require(path.resolve(__dirname, './testData.json'));

/**
 * Creates a browser context and initializes a new page.
 * @returns {Promise<{browser: Browser, context: BrowserContext, page: Page}>}
 */
async function createBrowserContext() {
  const chromeProject = config.projects.find(project => project.name === 'Chrome');

  if (!chromeProject) {
    throw new Error('Chrome project not found');
  }

  // Launch the browser with the configuration data
  const browser = await chromium.launch(chromeProject.use);
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the page and accept cookies
  await page.goto(testData.siteURL, { timeout: 30000 }); // Timeout added for robustness
  const acceptCookiesButton = await page.locator('button', { hasText: /accept cookies|accept all cookies/i });
  if (await acceptCookiesButton.isVisible()) {
    await acceptCookiesButton.click();
  }

  // Verify the page title
  const title = await page.title();
  if (title !== 'MySight') {
    throw new Error(`Expected page title "MySight", but received: "${title}"`);
  }

  return { browser, context, page };
}

/**
 * Closes the browser instance.
 * @param {Browser} browser - The browser instance to close.
 */
async function closeBrowser(browser) {
  await browser.close();
}

/**
 * Selects the next valid day on the calendar.
 * @param {Page} page - The Playwright page instance.
 * @returns {Promise<string>} The selector for the next valid day.
 */
async function selectNextValidDay(page) {
  const currentDate = new Date();
  let nextDay = currentDate.getDate(); // Start with the current day
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Determine the next valid day
  if (dayOfWeek === 0) {
    nextDay += 2; // Skip Sunday, go to Tuesday
  } else if (dayOfWeek === 6) {
    nextDay += 3; // Skip Saturday, go to Tuesday
  } else {
    nextDay += 1; // Otherwise, go to the next day
  }

  // Construct the selector for the next valid day
  const nextDaySelector = `[data-test-id="day_${nextDay}_of_the_month_button"]`;
  return nextDaySelector;
}

/**
 * Generates a unique email address for testing purposes.
 * @returns {string} A randomly generated email address.
 */
function generateRandomEmail() {
  const timestamp = Date.now();
  return `testuser_${timestamp}@example.com`;
}

/**
 * Updates the user's email in the test data JSON file.
 * @param {string} filePath - The file path of the test data JSON file.
 * @returns {string} The new email address.
 */
function updateEmailInTestData(filePath) {
  const testData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Generate and set a new email
  const newEmail = generateRandomEmail();
  testData.user.email = newEmail;

  // Save the updated test data
  fs.writeFileSync(filePath, JSON.stringify(testData, null, 2));

  return newEmail;
}

/**
 * Logs a user into the application.
 * @param {Page} page - The Playwright page instance.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
async function login(page, email, password) {
  // Click the "Log in" button
  await page.locator('[data-test-id="header_log_in_button"]').click();

  // Fill in the email and password fields
  await page.locator('[data-test-id="login_page_emailaddresss_input"]').fill(email);
  await page.locator('[data-test-id="login_page_password_input"]').fill(password);

  // Click the "Log in" button
  await page.locator('[data-test-id="account_login_log_in_button"]').click();

  // Wait for the Dashboard link to be visible
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
}

module.exports = {
  createBrowserContext,
  closeBrowser,
  selectNextValidDay,
  generateRandomEmail,
  updateEmailInTestData,
  login
};
