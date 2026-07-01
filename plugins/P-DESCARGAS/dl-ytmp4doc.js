import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { playvid } from '../../lib/scrapers/playvideo.js'

const DELIRIUS = 'https://api.delirius.store/download'

async function fetchMp4(url) {
  const formats = ['720p', '480p', '360p']
  let last

  for (const format of formats) {
    try {
      const { data } = await axios.get(
        `${DELIRIUS}/ytmp4?url=${encodeURIComponent(url)}&format=${format}`,
        { timeout: 30000 }
      )

      if ((data?.status || data?.success) && data?.data?.download) {
        return data.data
      }
    } catch (e) {
      last = e
    }
  }

  try {
    const fallback = await playvid.convert(url, '360p')

    if (fallback?.url) {
      return {
        download: fallback.url,
        title: fallback.filename || 'YouTube Video'
      }
    }
  } catch (e) {
    last = e
  }

  throw last || new Error('No se pudo descargar el video')
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `✧ Ingresa un enlace de YouTube.\n\nEjemplo:\n${usedPrefix}${command} https://youtu.be/xxxxx`
    )
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  })

  const tmpDir = './tmp'

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const filePath = path.join(
    tmpDir,
    `ytmp4_${Date.now()}.mp4`
  )

  try {
    const ytUrl = text.startsWith('http')
  ? text
  : `https://www.youtube.com/watch?v=${text}`

const media = await fetchMp4(ytUrl)

    const res = await axios.get(media.download, {
      responseType: 'stream',
      timeout: 120000
    })

    await pipeline(
      res.data,
      fs.createWriteStream(filePath)
    )

    await conn.sendMessage(
  m.chat,
  {
    document: fs.readFileSync(filePath),
    mimetype: 'video/mp4',
    fileName: `${media.title}.mp4`,
    caption: `╭━━━〔 ✅ VIDEO DESCARGADO 〕━━━⬣
┃ 🎬 *Título:*
┃ ${media.title}
┃ 📄 *Formato:* Documento MP4
╰━━━━━━━━━━━━━━━━━━⬣`
  },
  { quoted: m }
)
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('[YTMP4]', e)

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

    m.reply('✧ No se pudo descargar el video.')
  } finally {
    await rm(filePath, { force: true }).catch(() => {})
  }
}

handler.help = ['ytmp4 <url>']
handler.tags = ['descargas']
handler.command = ['ytmp4doc', 'ytvdoc']

export default handler