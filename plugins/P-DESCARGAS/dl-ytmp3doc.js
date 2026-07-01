import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { playaudio } from '../../lib/scrapers/playaudio.js'

const DELIRIUS = 'https://api.delirius.store/download'

async function fetchMp3(url) {
  const endpoints = [
    `${DELIRIUS}/ytmp3?url=${encodeURIComponent(url)}`,
    `${DELIRIUS}/ytmp3v2?url=${encodeURIComponent(url)}`
  ]

  let last

  for (const ep of endpoints) {
    try {
      const { data } = await axios.get(ep, {
        timeout: 30000
      })

      const ok = data?.status === true || data?.success === true

      if (ok && data?.data?.download) {
        return data.data
      }
    } catch (e) {
      last = e
    }
  }

  try {
    const fallback = await playaudio.convert(url, '128k')

    if (fallback?.url) {
      return {
        download: fallback.url,
        title: fallback.filename || 'YouTube Audio'
      }
    }
  } catch (e) {
    last = e
  }

  throw last || new Error('No se pudo descargar el audio')
}

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(
      `✧ Ingresa un enlace de YouTube.\n\nEjemplo:\n.${command} https://youtu.be/xxxxx`
    )
  }

  await conn.sendMessage(m.chat, {
    react: {
      text: '⏳',
      key: m.key
    }
  })

  const tmpDir = './tmp'

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const filePath = path.join(
    tmpDir,
    `ytmp3_${Date.now()}.mp3`
  )

  try {
    const ytUrl = text.startsWith('http')
  ? text
  : `https://www.youtube.com/watch?v=${text}`

const media = await fetchMp3(ytUrl)
    const res = await axios.get(media.download, {
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    await pipeline(
      res.data,
      fs.createWriteStream(filePath)
    )

    const isDoc = ['ytmp3doc', 'ytadoc'].includes(command)

    if (isDoc) {
      await conn.sendMessage(
  m.chat,
  {
    document: fs.readFileSync(filePath),
    mimetype: 'audio/mpeg',
    fileName: `${media.title}.mp3`,
    caption: `╭━━━〔 ✅ DESCARGA COMPLETADA 〕━━━⬣
┃ 🎬 *Título:*
┃ ${media.title}
╰━━━━━━━━━━━━━━━━━━⬣`
  },
  { quoted: m }
)
    } else {
      await conn.sendMessage(
        m.chat,
        {
          audio: fs.readFileSync(filePath),
          mimetype: 'audio/mpeg',
          fileName: `${media.title}.mp3`
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    console.error('[YTMP3]', e)

    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    })

    m.reply('✧ No se pudo descargar el audio.')
  } finally {
    await rm(filePath, {
      force: true
    }).catch(() => {})
  }
}

handler.help = [
  'ytmp3 <url>',
  'ytmp3doc <url>'
]

handler.tags = ['descargas']

handler.command = [
  'ytmp3',
  'yta',
  'ytmp3doc',
  'ytadoc'
]

export default handler