let mutedUsers = {};

let muteHandler = async (m, { conn, args }) => {
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

let unmuteHandler = async (m, { conn }) => {
  if (!m.quoted) throw `✳️ Please reply to a message to unmute the user.`;

  let user = m.quoted.sender;
  if (mutedUsers[user]) {
    delete mutedUsers[user];
    conn.sendMessage(m.chat, { text: `🔊 User has been unmuted.` });
  } else {
    conn.sendMessage(m.chat, { text: `✳️ User is not muted.` });
  }
};

muteHandler.before = async (m, { conn }) => {
  let user = m.sender;
  if (mutedUsers[user] && Date.now() < mutedUsers[user]) {
    await conn.sendMessage(m.chat, { delete: m.key });
    return true;
  }
  return false;
};

muteHandler.help = ['mute <duration>'];
muteHandler.tags = ['group'];
muteHandler.command = /^mute$/i;
muteHandler.group = true;
muteHandler.admin = true;
muteHandler.botAdmin = true;

unmuteHandler.help = ['unmute'];
unmuteHandler.tags = ['group'];
unmuteHandler.command = /^unmute$/i;
unmuteHandler.group = true;
unmuteHandler.admin = true;
unmuteHandler.botAdmin = true;

export default { muteHandler, unmuteHandler };

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
