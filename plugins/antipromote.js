const isAd = /(buy now|limited offer|discount|sale|promo|visit our website|click here|subscribe|follow us)/i

import axios from 'axios'
import fetch from 'node-fetch'

export async function before(m, { isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return !0
  if (!m.isGroup) return !1
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[this.user.jid] || {}
  const isAdMessage = isAd.exec(m.text)
  let removeParticipant = m.key.participant
  let messageId = m.key.id

  if (chat.antiAd && isAdMessage) {
    const groupName = m.chat
    const forwardGroupJid = "120363384295476485@g.us"
    const forwardMessage = `This is a possible promotion/ad attempt from group: ${groupName}\n\nMessage: ${m.text}`

    // Forward the message to the specified group
    await this.sendMessage(forwardGroupJid, { text: forwardMessage }, { quoted: m })

    // Optionally, you can remove the participant or take other actions
    // await this.groupParticipantsUpdate(m.chat, [removeParticipant], 'remove')
  }
  return !1
}