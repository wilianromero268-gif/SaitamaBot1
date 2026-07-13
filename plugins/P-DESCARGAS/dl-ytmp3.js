import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import config from '../../config.js'
import { playaudio } from '../../lib/scrapers/playaudio.js'
import { writeAudioTags } from '../../lib/audioTags.js'

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

const handler = async (m, { conn, text, userDb }) => {
  if (!text) {
    return m.reply(
      `*⌬┤ ✙ ├⌬ USO.*\n> Ejemplo:\n.ytmp3 https://youtu.be/xxxxx`
    )
  }

  if (userDb.genos < 1) {
    return m.reply(
      `*⌬┤ 💎 ├⌬ SIN ${config.PREMIUM_NAME.toUpperCase()}.*\n> No tenés suficientes ${config.PREMIUM_NAME} para usar este comando.`
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

    await writeAudioTags(filePath, media)

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1000) {
      throw new Error('Archivo inválido')
    }

    userDb.genos -= 1
    await userDb.save()

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: filePath },
        mimetype: 'audio/mpeg',
        fileName: `${media.title}.mp3`
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        text: `${config.PREMIUM_SYMBOL} Utilizaste *1 ${config.PREMIUM_NAME}*`
      },
      { quoted: m }
    )

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

handler.help = ['ytmp3 <url>']
handler.tags = ['descargas']
handler.command = ['ytmp3', 'yta']
handler.register = true

export default handler
