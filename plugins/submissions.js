// Command metadata
// Description: Fetch and parse submissions from a website
// Usage: !submissions
// Author: Your Name
// Date: YYYY-MM-DD

import puppeteer from 'puppeteer';

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  await conn.reply(m.chat, 'Please wait...', m);

  try {
    // Launch a headless browser with necessary flags
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to the URL and wait for the JavaScript challenge to complete
    const url = 'https://comfortcorner.unaux.com/wp-json/cf7-views/v1/get-data';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get the page content after the JavaScript challenge
    const text = await page.evaluate(() => document.body.innerText);

    console.log('Fetched Response Text:', text); // Debug: Log the fetched response text

    // Close the browser
    await browser.close();

    // Attempt to parse the response as JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      await conn.reply(m.chat, 'An error occurred while parsing the response.', m);
      return;
    }

    console.log('Fetched JSON:', json); // Debug: Log the fetched JSON

    // Check if the response is successful
    if (!json.success) {
      await conn.reply(m.chat, 'Failed to fetch submissions.', m);
      return;
    }

    // Parse the JSON to extract desired elements
    // ...existing code...
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, 'An error occurred while fetching submissions.', m);
  }
};

// Command metadata
handler.help = ['submissions'];
handler.tags = ['tools'];
handler.command = /^(submissions)$/i;
handler.admin = false;
handler.group = false;

export default handler;
