import fetch from 'node-fetch'
/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { getBinaryNodeChild, getBinaryNodeChildren } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn }) => {
    const response = await conn.query({
        tag: 'iq',
        attrs: {
            type: 'get',
            xmlns: 'w:g2',
            to: m.chat,
        },
        content: [{ tag: 'add', attrs: {} }]
    })

    const pp = await conn.profilePictureUrl(m.chat).catch(_ => null)
    const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0)
    const add = getBinaryNodeChild(response, 'add')
    const participant = getBinaryNodeChildren(add, 'participant')

    for (const user of participant.filter(item => item.attrs.error == 403)) {
        const jid = user.attrs.jid
        const content = getBinaryNodeChild(user, 'add_request')
        const invite_code = content.attrs.code
        const invite_code_exp = content.attrs.expiration

        // Extract country code and check if it's foreign
        const countryCode = jid.split('@')[0].slice(0, 2)
        if (countryCode === '91') { // Assuming '91' is the desired country code
            // Accept the joining request
            await conn.groupAcceptInvite(invite_code)
        }
    }
}

handler.help = ['add']
handler.tags = ['group']
handler.command = ['acpt']
handler.admin = true
handler.group = true
handler.rowner = true
handler.botAdmin = true

export default handler