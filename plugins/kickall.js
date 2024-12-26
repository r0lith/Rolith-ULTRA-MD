let handler = async (m, { conn, participants, isAdmin, isOwner, groupMetadata }) => {
  if (!isAdmin) return m.reply('✳️ This command can only be used by group admins.')

  let groupAdmins = participants.filter(p => p.admin).map(p => p.id)
  let users = participants.map(u => u.id).filter(v => v !== conn.user.jid && !groupAdmins.includes(v))
  
  for (let user of users) {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
  }

  m.reply(
    `▢ Group : *${groupMetadata.subject}*\n▢ Members Kicked : *${users.length}*\n┌───⊷ *KICKED MEMBERS*\n` +
      users.map(v => '▢ @' + v.replace(/@.+/, '')).join`\n` +
      '\n└──',
    null,
    {
      mentions: users,
    }
  )
}

handler.help = ['kickall']
handler.tags = ['group']
handler.command = ['kickall']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler