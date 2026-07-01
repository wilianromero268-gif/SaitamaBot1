import fetch from 'node-fetch'
import config from '../../config.js'
import User from '../../lib/database/models/zen-users.js'

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ✙ ├⌬ ENLACE REQUERIDO.*\n> Enviá o respondé a un mensaje con un enlace de Facebook válido.`)
  if (!/facebook\.com|fb\.watch/i.test(url)) return m.reply(`*⌬┤ ✙ ├⌬ ENLACE INVÁLIDO.*\n> Asegurate de que sea de Facebook.`)
  if (userDb.genos < 1) return m.reply(`*⌬┤ 💎 ├⌬ SIN ${config.PREMIUM_NAME.toUpperCase()}.*\n> No tenés suficientes ${config.PREMIUM_NAME} para usar este comando.`)

  const chatId = m.chat
  await m.reply(`*⌬┤ 📥 ├⌬ Descargando video de Facebook...*`)
  
  try {
    let videoUrl = null
    let caption = `*⌬┤ 📘 ├⌬ FACEBOOK*`

    try {
      const response = await fetch(`https://luxinfinity.vercel.app/api/facebook?url=${encodeURIComponent(url)}`)
      const json = await response.json()
      if (json.status && json.data) {
        const data = json.data
        videoUrl = data.hd || data.sd || null
        if (videoUrl) caption = `*⌬┤ 📘 ├⌬ FACEBOOK*\n> 📝 ${data.description || 'Sin descripción'}\n> ⏱️ *Duración:* ${data.duration || '—'}\n> 🎬 *Calidad:* ${data.hd ? 'HD' : 'SD'}`
      }
    } catch {}

    if (!videoUrl) {
      try {
        const response = await fetch(`https://api.delirius.store/download/facebook?url=${encodeURIComponent(url)}`)
        const json = await response.json()
        if (json.status && Array.isArray(json.list) && json.list.length) {
          videoUrl = json.list[0].url
          if (videoUrl) caption = `*⌬┤ 📘 ├⌬ FACEBOOK*\n> 🎬 *Calidad:* ${json.list[0].quality || 'SD'}`
        }
      } catch {}
    }

    if (!videoUrl) return m.reply(`*⌬┤ ✙ ├⌬ SIN VIDEO.*\n> No se encontró video en ese enlace.`)
    
    const buf = Buffer.from(await (await fetch(videoUrl, { timeout: 60000 })).arrayBuffer())
    
    await conn.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', caption }, { quoted: m })
    
    await User.updateOne(
  { jid: m.sender },
  { $inc: { genos: -1 } }
)

userDb.genos = Math.max(0, (userDb.genos || 0) - 1)

await conn.sendMessage(chatId, {
  text: `${config.PREMIUM_SYMBOL} Utilizaste *1 ${config.PREMIUM_NAME}*`
}, { quoted: m })

} catch (e) {
  console.error(e)
  m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> No se pudo completar la descarga.`)
}
}

handler.help = [`fb <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['fbdl', 'fb', 'facebook', 'facebookdl']
handler.tags = ['descargas']

export default handler