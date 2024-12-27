let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Sound
  let name = m.pushName || conn.getName(m.sender);
  let img = 'https://i.imgur.com/s0SqG3g.jpeg';
  let con = {
    key: {
      fromMe: false,
      participant: `${m.sender.split`@`[0]}@s.whatsapp.net`,
      ...(m.chat ? { remoteJid: '16504228206@s.whatsapp.net' } : {}),
    },
    message: {
      contactMessage: {
        displayName: `${name}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      },
    },
  };

  let buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: 'Menu' }, type: 1 },
    { buttonId: `${usedPrefix}donate`, buttonText: { displayText: 'Donate' }, type: 1 },
    { buttonId: `${usedPrefix}info`, buttonText: { displayText: 'Info' }, type: 1 }
  ];

  let buttonMessage = {
    text: 'Riruru Initializing', // Text content in case a message body is needed
    footer: 'Rolith',
    buttons: buttons,
    headerType: 1,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: 'Rolith',
        body: 'Rolith',
        thumbnailUrl: img,
        sourceUrl: 'https://wa.me/+919737825303',
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };

  // Send the message with the buttons
  await conn.sendMessage(m.chat, buttonMessage, { quoted: con });
};

handler.help = ['alive'];
handler.tags = ['main'];
handler.command = /^(alive)$/i;

export default handler;
