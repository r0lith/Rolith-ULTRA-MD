import fetch from 'node-fetch'
import https from 'https'

const agent = new https.Agent({
  rejectUnauthorized: false
})

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {}
  await conn.reply(m.chat, 'Please wait...', m)

  try {
    // Fetch HTML from the specified website with SSL verification disabled
    const url = `https://comfortcorner.unaux.com/submissions/`
    const response = await fetch(url, { agent })
    if (!response.ok) throw new Error('Failed to fetch the website content')
    const html = await response.text()

    // Simple HTML parsing without cheerio
    const results = []
    const regex = /<tr>([\s\S]*?)<\/tr>/g
    let match
    while ((match = regex.exec(html)) !== null) {
      const trHtml = match[1]
      const subjectMatch = /<td class="field-your-subject">([\s\S]*?)<\/td>/.exec(trHtml)
      const messageMatch = /<td class="field-your-message">([\s\S]*?)<\/td>/.exec(trHtml)
      if (subjectMatch && messageMatch) {
        const subject = subjectMatch[1].trim()
        const message = messageMatch[1].trim()
        results.push({ subject, message })
      }
    }

    // Limit to the first 10 results
    const limitedResults = results.slice(0, 10)

    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n [ ⭐ Reply the number of the desired submission to get more details]. \n\n`
    const orderedLinks = limitedResults.map((item, index) => {
      const sectionNumber = index + 1
      const { subject } = item
      return `*${sectionNumber}.* ${subject}`
    })

    const orderedLinksText = orderedLinks.join('\n\n')
    const fullText = `${infoText}\n\n${orderedLinksText}`
    const { key } = await conn.reply(m.chat, fullText, m)
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, {
          delete: key,
        })
        delete conn.mywebsite[m.sender]
      }, 150 * 1000),
    }
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m)
  }
}

handler.before = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {}
  if (m.isBaileys || !(m.sender in conn.mywebsite)) return
  const { results, key, timeout } = conn.mywebsite[m.sender]
  console.log(conn.mywebsite)
  if (!m.quoted || m.quoted.id !== key.id || !m.text) return
  const choice = m.text.trim()
  const inputNumber = Number(choice)
  if (inputNumber >= 1 && inputNumber <= results.length) {
    const selectedItem = results[inputNumber - 1]
    console.log('selectedItem', selectedItem)

    // Respond with more details about the selected item
    const detailsText = `*Subject:* ${selectedItem.subject}\n*Message:* ${selectedItem.message}`
    await conn.reply(m.chat, detailsText, m)
  } else {
    m.reply(
      'Invalid sequence number. Please select the appropriate number from the list above.\nBetween 1 to ' +
        results.length
    )
  }
}

handler.help = ['submissions']
handler.tags = ['tools']
handler.command = /^(submissions)$/i
handler.admin = false
handler.group = false

export default handler
