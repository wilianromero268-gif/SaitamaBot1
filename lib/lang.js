import axios from 'axios'
import { getSubBotMeta } from './jadibot.js'

export async function translateText(conn, text) {
  try {
    if (!conn.isSubBot) return text

    const meta = await getSubBotMeta()
    const lang = meta[conn.ownerNumber]?.language || 'es'

    if (lang === 'es') return text

    const { data } = await axios.post(
      'https://libretranslate.com/translate',
      {
        q: text,
        source: 'es',
        target: lang,
        format: 'text'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return data.translatedText || text
  } catch (e) {
    console.error('Error al traducir:', e.message)
    return text
  }
}
