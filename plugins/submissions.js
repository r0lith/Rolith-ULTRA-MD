async function loadTabletop() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tabletop.js/1.5.1/tabletop.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function fetchGoogleSheetData() {
  await loadTabletop()
  return new Promise((resolve, reject) => {
    Tabletop.init({
      key: 'https://docs.google.com/spreadsheets/d/1NJfDC9dywSGcaebNPMaL7CrbrgNy-VgnQU61xOSBI_w/pubhtml',
      callback: (data, tabletop) => {
        resolve(data)
      },
      simpleSheet: true,
      error: (error) => {
        reject(error)
      }
    })
  })
}

handler.before = async (m, { conn }) => {
  try {
    const data = await fetchGoogleSheetData()
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
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m)
  }
}

handler.help = ['submissions']
handler.tags = ['tools']
handler.command = /^(submissions)$/i
handler.admin = false
handler.group = false

export default handler
