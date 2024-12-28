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
    { buttonId: 'id3', buttonText: { displayText: 'Official Website' }, type: 1, url: 'https://amdaniwasa.com/' },
    { buttonId: 'id4', buttonText: { displayText: 'YouTube Channel' }, type: 1, url: 'https://www.youtube.com/channel/UCZx8U1EU95-Wn9mH4dn15vQ' }
  ];

  let messageContent = {
    text: 'Riruru Initializing', // Text content in case a message body is needed
    footer: 'Choose an option below:',
    buttons: buttons,
    headerType: 1, // 1 for text message
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

  // Send the message with the external ad reply and buttons
  await conn.sendMessage(m.chat, messageContent, { quoted: con });
};

handler.help = ['alive'];
handler.tags = ['main'];
handler.command = /^(alive)$/i;

export default handler;
