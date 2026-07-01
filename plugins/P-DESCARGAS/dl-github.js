import fetch from 'node-fetch'
import config from '../../config.js'
import User from '../../lib/database/models/zen-users.js'

const MAX_REPO = 100
const GIT_REGEX = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ❗ ├⌬ LINK REQUERIDO.*\n> Enviá o respondé a un mensaje con un enlace de GitHub válido.`)
  if (!GIT_REGEX.test(url)) return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Asegurate de que sea un link de GitHub válido.`)
  if (userDb.genos < 1) return m.reply(`*⌬┤ 💎 ├⌬ SIN ${config.PREMIUM_NAME.toUpperCase()}.*\n> No tenés suficientes ${config.PREMIUM_NAME} para usar este comando.`)

  const chatId = m.chat
  let [, ghUser, repo] = url.match(GIT_REGEX)
  repo = repo.replace(/\.git$/i, '')
  await m.reply(`*⌬┤ ⏳ ├⌬ Descargando repositorio...*\n> 📌 Límite: ${MAX_REPO} MB`)

  try {
    const apiRes = await fetch(`https://api.github.com/repos/${ghUser}/${repo}`, {
      headers: { 'User-Agent': 'ZEN-BOT', 'Accept': 'application/vnd.github+json' },
      timeout: 15_000
    })

    if (!apiRes.ok) return m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> El repo no existe, es privado o GitHub no respondió.`)

    const info = await apiRes.json()
    const branch = info.default_branch || 'main'
    const sizeKB = info.size || 0

    if (sizeKB / 1024 > MAX_REPO) {
      return m.reply(`*⌬┤ ❌ ├⌬ REPO MUY GRANDE.*\n> El repo pesa ~${Math.round(sizeKB / 1024)} MB y supera el límite de ${MAX_REPO} MB.`)
    }

    const zipUrl = `https://github.com/${ghUser}/${repo}/archive/refs/heads/${branch}.zip`
    const res = await fetch(zipUrl, { timeout: 60_000 })

    if (!res.ok) return m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> No se pudo descargar el archivo ZIP del repositorio.`)

    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length / (1024 * 1024) > MAX_REPO) {
      return m.reply(`*⌬┤ ❌ ├⌬ REPO MUY GRANDE.*\n> El archivo supera el límite de ${MAX_REPO} MB.`)
    }

    const stars = info.stargazers_count?.toLocaleString('es-AR') || '0'
    const forks = info.forks_count?.toLocaleString('es-AR') || '0'
    const lang  = info.language || 'N/A'
    const desc  = info.description ? `\n> 📝 ${info.description}` : ''

    await conn.sendMessage(chatId, {
      document: buffer,
      mimetype: 'application/zip',
      fileName: `${repo}-${branch}.zip`,
      caption: `*⌬┤ 🐙 ├⌬ GITHUB*${desc}\n> 🌿 *Branch:* ${branch}\n> ⭐ *Stars:* ${stars}\n> 🍴 *Forks:* ${forks}\n> 💻 *Lenguaje:* ${lang}`
    }, { quoted: m })

    await User.updateOne(
  { jid: m.sender },
  { $inc: { genos: -1 } }
)

userDb.genos = Math.max(0, (userDb.genos || 0) - 1)

await conn.sendMessage(chatId, {
  text: `${config.PREMIUM_SYMBOL} Utilizaste *1 ${config.PREMIUM_NAME}*`
}, { quoted: m })

  } catch (e) {
    console.error('[GIT]', e.message)
    return m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> No se pudo completar. Intentá de nuevo.`)
  }
}

handler.help = [`gitclone <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['gitclone', 'git', 'repositorio', 'repo', 'gitc']
handler.tags = ['descargas']

export default handler