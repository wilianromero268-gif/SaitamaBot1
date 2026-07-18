import axios from 'axios'
import { getSubBotMeta } from './jadibot.js'

const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'
// Si tu cuenta es Pro usa:
// https://api.deepl.com/v2/translate

export async function translateText(conn, text) {
  try {
    if (!text || typeof text !== 'string') return text

    // Solo subbots
    if (!conn?.isSubBot) return text

    const meta = await getSubBotMeta()

    const lang = meta[conn.ownerNumber]?.language || 'es'

    // Español no necesita traducción
    if (lang === 'es') return text

    const res = await axios.post(
      DEEPL_URL,
      {
        text: [text],
        target_lang: lang.toUpperCase()
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return res.data?.translations?.[0]?.text || text

  } catch (e) {
    console.error('[DEEPL ERROR]', e.response?.data || e.message)
    return text
  }
}
