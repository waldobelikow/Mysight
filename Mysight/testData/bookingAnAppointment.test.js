const { test, expect } = require('@playwright/test');
const { createBrowserContext, closeBrowser, selectNextValidDay, generateRandomEmail, updateEmailInTestData } = require('./testUtils');
const fs = require('fs');
const path = require('path');

// Path to the test data file
const testDataPath = path.resolve(__dirname, './testData.json');

let browser;
let page;
let testData;

// Set up the browser and page before all tests
test.beforeAll(async () => {
  ({ browser, page } = await createBrowserContext());

  // Update the email in test data before tests
  updateEmailInTestData(testDataPath);

  // Load the updated test data
  testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
});

// Clean up after all tests
test.afterAll(async () => {
  await closeBrowser(browser);
});

// Test: Select MagoosBeta Opticians branch
test('Select MagoosBeta Opticians branch', async () => {
  await test.step('Click the "MagoosBeta Opticians" button', async () => {
    await page.getByRole('button', { name: 'MagoosBeta Opticians' }).click();
  });

  await test.step('Verify the "Book Online" button is visible', async () => {
    const bookOnlineButton = page.getByRole('button', { name: 'Book Online' });
    await expect(bookOnlineButton).toBeVisible();
  });

  await test.step('Click the "Book Online" button', async () => {
    await page.getByRole('button', { name: 'Book Online' }).click();
  });
});

// Test: Select Appointment type
test('Select Appointment type', async () => {
  await test.step('Verify the "Choose an appointment type" label is visible', async () => {
    const chooseAppointmentLabel = page.locator('[data-test-id="appointment_type_choose_appointment_text"]');
    await expect(chooseAppointmentLabel).toBeVisible();
  });

    await test.step(`Verify and click the "${testData.appointments.type}" button`, async () => {
    const contactLensFitButton = page.locator(`[data-test-id="appointment_type_${testData.appointments.type}"]`);
    await expect(contactLensFitButton).toBeVisible();
    await contactLensFitButton.click();
  });

  await test.step('Verify the "Next" button is enabled and click it', async () => {
    const nextButton = page.locator('[data-test-id="next_button"]');
    expect(await nextButton.isDisabled()).toBe(false, 'The "Next" button should be enabled!');
    await nextButton.click();
  });
});

// Test: Select date and time
test('Select date and time', async () => {
  await test.step('Verify the "Select date and time" label is visible', async () => {
    const selectDateAndTimeLabel = page.locator('[data-test-id="date_time_choose_date_time_text"]');
    await expect(selectDateAndTimeLabel).toBeVisible();
  });

  await test.step('Select the next valid day, skipping Sunday and Monday', async () => {
    const nextDaySelector = await selectNextValidDay(page);
    await page.locator(nextDaySelector).click();
  });

  await test.step('Select the first available time slot', async () => {
    await page.locator('[data-test-id="choose_appointment_appointment_slot_button_0"]').click();
  });

  await test.step('Verify the "Book now" button is enabled and click it', async () => {
    const bookNowButton = page.getByRole('button', { name: 'Book now' });
    expect(await bookNowButton.isDisabled()).toBe(false, 'The "Book now" button should be enabled!');
    await bookNowButton.click();
  });
});

// Test: Enter account details
test('Enter account details', async () => {
  await test.step('Verify the "We just need your details to confirm your appointment" label is visible', async () => {
    const enterDetailsLabel = page.locator('[data-test-id="email_check_we_need_your_details_text"]');
    await expect(enterDetailsLabel).toBeVisible();
  });

  await test.step('Enter the email address', async () => {
    await page.locator('[data-test-id="email_check_email_address_input"]').fill(testData.user.email);
  });

  await test.step('Select title from dropdown', async () => {
    await page.locator('[data-test-id="your_details_title_dropdown"]').selectOption({ label: testData.user.userDetails.title });
  });

  await test.step('Enter first name', async () => {
    await page.locator('[data-test-id="your_details_first_name_input"]').fill(testData.user.userDetails.firstName);
  });

  await test.step('Enter last name', async () => {
    await page.locator('[data-test-id="your_details_last_name_input"]').fill(testData.user.userDetails.lastName);
  });

  await test.step('Enter date of birth', async () => {
    await page.locator('[data-test-id="your_details_date_of_birth_input"]').fill(testData.user.userDetails.dateOfBirth);
  });

  await test.step('Enter address', async () => {
    const addressInput = page.getByPlaceholder('Start typing your address or');
    await addressInput.fill(testData.user.userDetails.address);
    await page.getByRole('option', { name: testData.user.userDetails.address }).click();
  });

  await test.step('Enter phone number', async () => {
    await page.locator('[data-test-id="your_details_phone_number_input"]').fill(testData.user.userDetails.phoneNumber);
  });

  await test.step('Enter password', async () => {
    await page.locator('[data-test-id="choose_password_input"]').fill(testData.user.password);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second for stability
  });

  await test.step('Click the "Finish" button', async () => {
    await page.locator('[data-test-id="next_button"]').click();
  });

  await test.step('Verify the booking has been successful', async () => {
    const confirmationLabel = page.locator('[data-test-id="booking_confirmation_date_time_text"]');
    await expect(confirmationLabel).toBeVisible();
  });
});
