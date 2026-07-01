import config from '../../config.js'

const handler = async (m, { conn, command, groupDb, usedPrefix }) => {
  if (!m.isGroup) {
    return m.reply('*『 ❌ 』ESTE COMANDO SOLO FUNCIONA EN GRUPOS.*')
  }

  if (!groupDb.nsfw) {
    return m.reply(
      `*『 🔞 』NSFW DESACTIVADO.*\n` +
      `> Un administrador debe activar el NSFW con:\n` +
      `> *${usedPrefix}nsfw on*`
    )
  }

  try {
    const url = 'https://luxinfinity.vercel.app/api/nsfw/grils'

    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption: `*『 🔞 』PACK GIRLS*\n> Disfruta tu imagen aleatoria.`,
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
    console.error(e)
    m.reply('*『 ❌ 』ERROR.*\n> No se pudo obtener la imagen.')
  }
}

handler.help = ['girls']
handler.tags = ['nsfw']
handler.command = ['girls', 'pack']
handler.groupOnly = true
handler.register = true

export default handler