import axios from 'axios'
import config from '../../config.js'

const handler = async (m, { conn, command, groupDb, usedPrefix }) => {

  if (!m.isGroup) {
    return m.reply('*『 ❌ 』ESTE COMANDO SOLO FUNCIONA EN GRUPOS.*')
  }

  if (!groupDb.nsfw) {
    return m.reply(
      `*『 🔞 』NSFW DESACTIVADO.*\n\n` +
      `> Un administrador debe activarlo con:\n` +
      `> *${usedPrefix}nsfw on*`
    )
  }

  try {

    const api = 'https://api.delirius.store/nsfw/girls'

    const response = await axios.get(api, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const buffer = Buffer.from(response.data)

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption:
`『 🔞 』PACK GIRLS

│ Disfruta tu imagen aleatoria.`,
        footer: config.botname,
        buttons: [
          {
            buttonId: `${usedPrefix}${command}`,
            buttonText: {
              displayText: '🔄 SIGUIENTE PACK'
            },
            type: 1
          }
        ],
        headerType: 4
      },
      { quoted: m }
    )

  } catch (e) {

    console.error('[PACK GIRLS]', e)

    return m.reply(
      '*『 ❌ 』ERROR.*\n' +
      '> No se pudo obtener la imagen desde la API.'
    )

  }

}

handler.help = ['girls', 'pack']
handler.tags = ['nsfw']
handler.command = ['girls', 'pack']
handler.groupOnly = true
handler.register = true

export default handler