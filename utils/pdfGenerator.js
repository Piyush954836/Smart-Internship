const puppeteer = require("puppeteer");

async function generatePDF(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: "resume.pdf", format: "A4" });
    await browser.close();
}

module.exports = { generatePDF };
