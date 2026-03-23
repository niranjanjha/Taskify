const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Chrome...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log("Navigating to http://localhost:5173...");
  try {
    const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Response status:", response.status());
    const content = await page.content();
    if (content.includes('Something went wrong') || content.includes('Error')) {
      console.log("Found error text in DOM!");
    } else {
      console.log("No obvious error text found in DOM. Length:", content.length);
    }
  } catch (e) {
    console.error("Navigation failed:", e);
  }

  await browser.close();
  console.log("Done.");
})();
