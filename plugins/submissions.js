import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  await conn.reply(m.chat, 'Please wait...', m);

  try {
    const url = 'https://comfortcorner.unaux.com/submissions/';
    const response = await fetch(url, { agent });
    if (!response.ok) throw new Error('Failed to fetch the website content');
    const html = await response.text();

    console.log(html); // Log the fetched HTML content

    const results = [];
    const regex = /<tr>([\s\S]*?)<\/tr>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const trHtml = match[1];
      const subjectMatch = /<td class="field-your-subject">([\s\S]*?)<\/td>/i.exec(trHtml);
      const messageMatch = /<td class="field-your-message">([\s\S]*?)<\/td>/i.exec(trHtml);

      console.log('trHtml:', trHtml);
      console.log('subjectMatch:', subjectMatch);
      console.log('messageMatch:', messageMatch);

      if (subjectMatch && messageMatch) {
        results.push({
          subject: subjectMatch[1].trim(),
          message: messageMatch[1].trim(),
        });
      }
    }

    console.log('Parsed Results:', results);

    if (results.length === 0) {
      await conn.reply(m.chat, 'No submissions found.', m);
      return;
    }

    const limitedResults = results.slice(0, 5);
    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n[ ⭐ Reply with the number of the desired submission to get more details]. \n\n`;
    const orderedLinks = limitedResults.map((item, index) => `*${index + 1}.* ${item.subject}`).join('\n\n');
    const fullText = `${infoText}\n\n${orderedLinks}`;

    console.log('Final Message:', fullText);

    const { key } = await conn.reply(m.chat, fullText, m);
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, { delete: key });
        delete conn.mywebsite[m.sender];
      }, 150 * 1000),
    };
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

export default handler;
