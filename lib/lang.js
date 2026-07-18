import axios from 'axios'
import { getSubBotMeta } from './jadibot.js'

export async function translateText(conn, text) {
  try {
    if (!text || typeof text !== 'string') return text
    if (!conn?.isSubBot) return text

    const meta = await getSubBotMeta()
    const lang = meta[conn.ownerNumber]?.language || 'es'

    // Si el idioma es español, no traducir
    if (lang === 'es') return text

    const { data } = await axios.post(
      'https://libretranslate.com/translate',
      {
        q: text,
        source: 'auto',
        target: lang,
        format: 'text'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return data?.translatedText || text
  } catch (e) {
    console.error('[LibreTranslate]', e.message)
    return text
  }
}
