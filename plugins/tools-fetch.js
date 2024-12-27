import fetch from 'node-fetch';
import { format } from 'util';
import https from 'https';  // Import the https module

let handler = async (m, { text, conn }) => {
    if (!/^https?:\/\//.test(text)) throw `✳️ ${mssg.noLink('http:// o https://')}`;

    let _url = new URL(text);
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY');

    // Create an HTTPS agent to bypass certificate verification
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Pass the agent in the fetch options
    let res = await fetch(url, { agent });

    // Check content length
    if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
        // delete res
        throw `Content-Length: ${res.headers.get('content-length')}`;
    }

    // Check if the response is text or JSON
    if (!/text|json/.test(res.headers.get('content-type'))) {
        return conn.sendFile(m.chat, url, 'file', text, m);
    }

    // Fetch the response as a buffer
    let txt = await res.buffer();

    try {
        // Attempt to parse the response as JSON
        txt = format(JSON.parse(txt + ''));
    } catch (e) {
        txt = txt + '';
    } finally {
        // Send the response back, limiting the output length
        m.reply(txt.slice(0, 65536) + '');
    }
};

handler.help = ['get'];
handler.tags = ['tools'];
handler.command = /^(fetch|gets)$/i;

export default handler;
