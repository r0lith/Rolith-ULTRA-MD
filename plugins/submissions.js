import fetch from 'node-fetch'

async function handler(m, { conn, text }) {
  try {
    // Fetch data from the public Google Sheet
    const spreadsheetId = '1NJfDC9dywSGcaebNPMaL7CrbrgNy-VgnQU61xOSBI_w'
    const range = 'Sheet1!A2:B' // Adjust the range as needed
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch the Google Sheet content')
    const data = await response.json()
    const rows = data.values
    if (!rows.length) {
      console.log('No data found.')
      return
    }

    const results = rows.map(row => ({
      subject: row[0],
      message: row[1],
    }))

    console.log(results) // Log the parsed results

    // Limit to the first 10 results
    const limitedResults = results.slice(0, 10)

    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n [ ⭐ Reply the number of the desired submission to get more details]. \n\n`
    const orderedLinks = limitedResults.map((item, index) => {
      const sectionNumber = index + 1
      const { subject } = item
      return `*${sectionNumber}.* ${subject}`
    })

    const orderedLinksText = orderedLinks.join('\n\n')
    console.log(orderedLinksText) // Log the ordered links text
    const fullText = `${infoText}\n\n${orderedLinksText}`
    const { key } = await conn.reply(m.chat, fullText, m)
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
    }

    // Handle user input for selecting a submission
    const inputNumber = parseInt(text.trim())
    if (inputNumber > 0 && inputNumber <= results.length) {
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
  } catch (error) {
    console.error(error)
  }
}

handler.help = ['submissions']
handler.tags = ['tools']
handler.command = /^(submissions)$/i
handler.admin = false
handler.group = false

export default handler
