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
    let response = await fetch(url, { agent });
    let text = await response.text();

    // Check if the response is HTML with a JavaScript challenge
    if (text.includes('<html>') && text.includes('<script>')) {
      console.log('JavaScript challenge detected, attempting redirect handling...');
      // Extract the redirect URL from the JavaScript challenge
      const redirectUrlMatch = text.match(/location\.href="([^"]+)"/);
      if (redirectUrlMatch) {
        const redirectUrl = redirectUrlMatch[1];
        console.log('Redirecting to:', redirectUrl);
        // Follow the redirect to fetch the correct data
        response = await fetch(redirectUrl, { agent });
        text = await response.text();
      }
    }

    console.log('Fetched Response Text:', text); // Debug: Log the fetched response text

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
