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

  const buttons = [
    { buttonId: `${usedPrefix}system`, buttonText: { displayText: 'System Stats' }, type: 1 },
    { buttonId: `${usedPrefix}qaversion`, buttonText: { displayText: 'Version Check' }, type: 1 },
    { buttonId: 'id3', buttonText: { displayText: 'Official Website' }, type: 1 },
    { buttonId: 'id4', buttonText: { displayText: 'YouTube Channel' }, type: 1 }
  ];

  let buttonMessage = {
    text: 'Riruru Initializing',
    footer: 'Choose an option below:',
    buttons: buttons,
    headerType: 1, // 1 for text message
  };

  // Send the message with the buttons
  await conn.sendMessage(m.chat, buttonMessage, { quoted: con });
};

handler.help = ['alive'];
handler.tags = ['main'];
handler.command = /^(alive)$/i;

export default handler;
