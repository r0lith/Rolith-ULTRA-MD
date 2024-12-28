let mutedUsers = {};

let handler = async (m, { conn, args }) => {
  if (!m.quoted) throw `✳️ Please reply to a message to mute the user.`;

  let duration = args[0];
  if (!duration) throw `✳️ Please specify the duration, e.g., !mute 10m`;

  let time = parseDuration(duration);
  if (!time) throw `✳️ Invalid duration format. Use s, m, or h for seconds, minutes, or hours respectively.`;

  let user = m.quoted.sender;
  mutedUsers[user] = Date.now() + time;

  conn.sendMessage(m.chat, { text: `🔇 User has been muted for ${duration}.` });

  setTimeout(() => {
    delete mutedUsers[user];
    conn.sendMessage(m.chat, { text: `🔊 User has been unmuted.` });
  }, time);
};

handler.before = async (m, { conn }) => {
  let user = m.sender;
  if (mutedUsers[user] && Date.now() < mutedUsers[user]) {
    await conn.sendMessage(m.chat, { delete: m.key });
    return true;
  }
  return false;
};

handler.help = ['mute <duration>'];
handler.tags = ['group'];
handler.command = /^mute$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

function parseDuration(duration) {
  let match = duration.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;

  let value = parseInt(match[1]);
  let unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return null;
  }
}