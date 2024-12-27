import puppeteer from 'puppeteer';

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  await conn.reply(m.chat, 'Please wait...', m);

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set the URL of your submissions page
    const url = 'https://comfortcorner.unaux.com/submissions/';

    // Go to the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    // Wait for the table rows to load (adjust the selector if necessary)
    await page.waitForSelector('tr');

    // Extract the table content
    const results = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr')); // Select all rows
      const submissions = [];

      rows.forEach((row) => {
        const subjectElement = row.querySelector('.field-your-subject');
        const messageElement = row.querySelector('.field-your-message');

        if (subjectElement && messageElement) {
          const subject = subjectElement.textContent.trim();
          const message = messageElement.textContent.trim();
          submissions.push({ subject, message });
        }
      });

      return submissions;
    });

    // Close the browser
    await browser.close();

    if (results.length === 0) {
      await conn.reply(m.chat, 'No submissions found.', m);
      return;
    }

    // Limit to the first 5 results
    const limitedResults = results.slice(0, 5);

    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n[ ⭐ Reply the number of the desired submission to get more details].\n\n`;
    const orderedLinks = limitedResults.map((item, index) => {
      const sectionNumber = index + 1;
      const { subject } = item;
      return `*${sectionNumber}.* ${subject}`;
    });

    const orderedLinksText = orderedLinks.join('\n\n');
    const fullText = `${infoText}\n\n${orderedLinksText}`;
    const { key } = await conn.reply(m.chat, fullText, m);

    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, {
          delete: key,
        });
        delete conn.mywebsite[m.sender];
      }, 150 * 1000),
    };
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

handler.before = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  if (m.isBaileys || !(m.sender in conn.mywebsite)) return;

  const { results, key, timeout } = conn.mywebsite[m.sender];
  if (!m.quoted || m.quoted.id !== key.id || !m.text) return;

  const choice = m.text.trim();
  const inputNumber = Number(choice);

  if (inputNumber >= 1 && inputNumber <= results.length) {
    const selectedItem = results[inputNumber - 1];
    const detailsText = `*Subject:* ${selectedItem.subject}\n*Message:* ${selectedItem.message}`;
    await conn.reply(m.chat, detailsText, m);
  } else {
    m.reply(
      'Invalid sequence number. Please select the appropriate number from the list above.\nBetween 1 to ' +
        results.length
    );
  }
};

handler.help = ['submissions'];
handler.tags = ['tools'];
handler.command = /^(submissions)$/i;
handler.admin = false;
handler.group = false;

export default handler;
