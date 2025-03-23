import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../store-assets/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshots() {
  console.log('\x1b[34mℹ\x1b[0m Generating store screenshots...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Screenshot 1: Font detection on a typical webpage
    await page.goto('https://fonts.google.com');
    await page.waitForSelector('h1');
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(h1);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    await page.screenshot({
      path: path.join(screenshotsDir, '1-font-detection.png')
    });

    // Screenshot 2: Dark mode interface
    await page.goto('https://github.com');
    await page.waitForSelector('h1');
    await page.evaluate(() => {
      document.body.style.backgroundColor = '#1a1a1a';
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.style.color = '#ffffff';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(h1);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    await page.screenshot({
      path: path.join(screenshotsDir, '2-dark-mode.png')
    });

    // Screenshot 3: Error handling
    await page.goto('about:blank');
    await page.setContent(`
      <html>
        <body style="background-color: #1a1a1a; color: white; font-family: Arial;">
          <div style="padding: 20px;">
            <h1>Font Sniffer Error Handling</h1>
            <p>Please select some text to analyze its font properties.</p>
          </div>
        </body>
      </html>
    `);
    await page.screenshot({
      path: path.join(screenshotsDir, '3-error-handling.png')
    });

    console.log('\x1b[32m✓\x1b[0m Screenshots generated successfully in store-assets/screenshots/');
  } catch (error) {
    console.error('\x1b[31m✕\x1b[0m Error generating screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots(); 