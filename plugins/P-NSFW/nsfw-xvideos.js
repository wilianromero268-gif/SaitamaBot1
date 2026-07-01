import axios from 'axios'

const SEP = '─'.repeat(28)
const BASE = 'https://luxinfinity.vercel.app/api/nsfw/xvideos'

function buildListMsg(query, results) {
  let msg = `*⌬┤ 🔞 ├⌬ XVIDEOS — ${query.toUpperCase()}*\n\n`
  results.forEach((v, i) => {
    msg += `*${i + 1}.* 🎬 ${v.title}\n> ⏳ ${v.duration || '-'} | 👀 ${v.views || '-'}\n> 🔗 ${v.url}\n${SEP}\n`
  })
  return msg
}

const handler = async (m, { conn, command, args, usedPrefix, userDb }) => {
  const query = args.join(' ')
  await m.react('🔞')

  try {
    if (['xvideossearch', 'xvsearch'].includes(command)) {
      if (!query) return m.reply(`*⌬┤ ❗ ├⌬ FALTA TEXTO.*\n> Ingresá algo para buscar.\n> Ej: *${usedPrefix}${command}* colegiala`)
      await m.reply(`*⌬┤ ⏳ ├⌬ Buscando en XVideos...*`)
      const { data } = await axios.get(`${BASE}/search`, { params: { query, limit: 6 }, timeout: 15000 })
      const results = Array.isArray(data) ? data : (data.results ?? data.data ?? [])
      if (!results.length) return m.reply(`*⌬┤ ❌ ├⌬ SIN RESULTADOS.*\n> No se encontró nada para esa búsqueda.`)
      return conn.sendMessage(m.chat, { text: buildListMsg(query, results) }, { quoted: m })
    }

    if (['xvideos', 'xvideosdl'].includes(command)) {
      if (!args[0] || !args[0].includes('xvideos.com'))
        return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Ingresá un link válido de XVideos.\n> Ej: *${usedPrefix}${command} https://...*`)

      if (userDb.genos < 3)
        return m.reply(`*⌬┤ ✦ ├⌬ SIN KŌGEN.*\n> Necesitás *3 Genos* para descargar videos.\n> Usá *!kbuy <cantidad>* o *!kbuy all*.`)

      await m.reply(`*⌬┤ ⏳ ├⌬ Obteniendo video...*`)
      const { data } = await axios.get(`${BASE}/download`, { params: { url: args[0] }, timeout: 15000 })
      const video = data.download?.high || data.download?.low
      if (!video) return m.reply(`*⌬┤ ❌ ├⌬ SIN VIDEO.*\n> No se pudo obtener el video.`)

      await conn.sendMessage(m.chat, {
        video:    { url: video.url },
        mimetype: 'video/mp4',
        caption:  `*⌬┤ 🔞 ├⌬ XVIDEOS*\n\n🎬 *${data.title}*\n⏳ ${data.duration || '-'}\n👀 ${data.views || '0'}\n🔗 ${args[0]}`,
      }, { quoted: m })

      userDb.genos -= 3
      await userDb.save()
      await conn.sendMessage(m.chat, { text: `✦ Utilizaste *3 Genos*` }, { quoted: m })
    }
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> No se pudo procesar. Intentá de nuevo.`)
  }
}

handler.command = ['xvideossearch', 'xvsearch', 'xvideos', 'xvideosdl']
handler.tags = ['nsfw']
handler.help = ['xvideossearch <texto>', 'xvideos <link>']
handler.nsfw = true
export default handler
