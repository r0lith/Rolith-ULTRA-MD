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
    // Launch a headless browser
    const browser = await puppeteer.launch();
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
    const results = json.data.map(item => ({
      id: item.id,
      subject: item.content[0].trim(), // Extracting the subject
      message: item.content[1].trim(), // Extracting the message
    }));

    console.log('Parsed Results:', results); // Debug: Log parsed results

    // Check if no results were parsed
    if (results.length === 0) {
      await conn.reply(m.chat, 'No submissions found.', m);
      return;
    }

    // Limit the results to the first 5 entries
    const limitedResults = results.slice(0, 5);

    // Prepare the message with the parsed data
    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n[ ⭐ Reply with the number of the desired submission to get more details]. \n\n`;
    const orderedLinks = limitedResults
      .map((item, index) => `*${index + 1}.* ${item.subject}`) // Listing the subjects
      .join('\n\n');
    const fullText = `${infoText}\n\n${orderedLinks}`;

    console.log('Final Message:', fullText); // Debug: Log the final message

    // Send the message and store data for further interaction
    const { key } = await conn.reply(m.chat, fullText, m);
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
    };
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