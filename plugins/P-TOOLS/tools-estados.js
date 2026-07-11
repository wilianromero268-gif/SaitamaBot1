import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Buffer } from 'buffer'

const handler = async (m, { conn }) => {
  try {
    if (!m.quoted) {
      return m.reply('❌ Responde al estado (foto o video) con .estado')
    }

    const q = m.quoted

    // Detectar multimedia del estado
    const media =
      q.msg?.message?.videoMessage ||
      q.msg?.message?.imageMessage ||
      q.message?.groupStatusMessageV2?.message?.videoMessage ||
      q.message?.groupStatusMessageV2?.message?.imageMessage

    if (!media) {
      return m.reply('❌ No encontré imagen o video en el estado')
    }

    const mime = media.mimetype || ''

    await m.reply('⏳ Descargando estado...')

    let buffer

    // Descargar video
    if (mime.includes('video')) {
      const stream = await downloadContentFromMessage(media, 'video')
      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      buffer = Buffer.concat(chunks)
    }

    // Descargar imagen
    if (mime.includes('image')) {
      const stream = await downloadContentFromMessage(media, 'image')
      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      buffer = Buffer.concat(chunks)
    }

    if (!buffer) {
      return m.reply('❌ No pude obtener el archivo del estado')
    }

    // Enviar video
    if (mime.includes('video')) {
      await conn.sendMessage(m.chat, {
        video: buffer,
        caption: `
╭━━━〔 ⚡ *SAITAMABOT* ⚡ 〕━━━╮
┃
┃ 🥷 *ESTADO OBTENIDO*
┃ 🎬 *Tipo:* Video
┃ ✅ *Descarga completada*
┃
┃ 💥 *Powered by 𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩*
┃ 👑 *Creator:* 𝑺𝒂𝒊𝒅𝒆𝒗𝟏𝟒𝟓
┃
╰━━━━━━━━━━━━━━━━━━━━╯

🎵 *Sigue a mi creador en TikTok*
👑 *Saidev145*
🔗 https://www.tiktok.com/@sai16172?_r=1&_t=ZS-97okvUBLwyT
`
      }, { quoted: m })
    }

    // Enviar imagen
    if (mime.includes('image')) {
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `
╭━━━〔 ⚡ *SAITAMABOT* ⚡ 〕━━━╮
┃
┃ 🥷 *ESTADO OBTENIDO*
┃ 🎬 *Tipo:* Imagen
┃ ✅ *Descarga completada*
┃
┃ 💥 *Powered by 𝙎𝙖𝙞𝙩𝙖𝙢𝙖𝘽𝙤𝙩*
┃ 👑 *Creator:* 𝑺𝒂𝒊𝒅𝒆𝒗𝟏𝟒𝟓
┃
╰━━━━━━━━━━━━━━━━━━━━╯

🎵 *Sigue a mi creador en TikTok*
👑 *Saidev145*
🔗 https://www.tiktok.com/@sai16172?_r=1&_t=ZS-97okvUBLwyT
`
      }, { quoted: m })
    }

  } catch (e) {
    console.error('ERROR ESTADO:', e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['estado', 'pasa']
handler.help = ['estado']
handler.tags = ['tools']

export default handler