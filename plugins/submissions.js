// Command metadata
// Description: Fetch and parse submissions from a website
// Usage: !submissions
// Author: Your Name
// Date: YYYY-MM-DD

import fetch from 'node-fetch';
import https from 'https';

// Create an HTTPS agent to bypass SSL verification
const agent = new https.Agent({ rejectUnauthorized: false });

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  await conn.reply(m.chat, 'Please wait...', m);

  try {
    // Fetch the data from the WordPress REST endpoint
    const url = 'https://comfortcorner.unaux.com/wp-json/cf7-views/v1/get-data';
    const response = await fetch(url, { agent });
    if (!response.ok) throw new Error('Failed to fetch the website content');
    const data = await response.json();

    console.log('Fetched Data:', data); // Debug: Log the fetched data

    // Parse the data to extract desired elements
    const results = data.map(item => ({
      subject: item.subject.trim(),
      message: item.message.trim(),
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
      .map((item, index) => `*${index + 1}.* ${item.subject}`)
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
