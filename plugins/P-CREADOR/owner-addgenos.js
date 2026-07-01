import User from '../../lib/database/models/zen-users.js'

const handler = async (m, { conn, args }) => {

  let who

  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid?.length) {
    who = m.mentionedJid[0]
  } else if (args[0] && /^\d+$/.test(args[0])) {
    who = args[0] + '@s.whatsapp.net'
  }

  if (!who) {
    return m.reply(
      '*⌬┤ ❌ ├⌬ USUARIO INVÁLIDO.*\n' +
      '> Responde a un mensaje, menciona a alguien o escribe un número.'
    )
  }

  const cantidad = Number(
    m.quoted ? args[0] : args[1]
  )

  if (isNaN(cantidad) || cantidad <= 0) {
    return m.reply(
      '*⌬┤ ❌ ├⌬ CANTIDAD INVÁLIDA.*\n' +
      '> Ejemplo:\n' +
      '> #addgenos 50 (respondiendo a un usuario)'
    )
  }

  let usuario = await User.findOne({ jid: who })

  if (!usuario) {
    usuario = await User.create({
      jid: who,
      genos: cantidad
    })
  } else {
    await User.updateOne(
      { jid: who },
      { $inc: { genos: cantidad } }
    )

    usuario.genos += cantidad
  }

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*⌬┤ 👊 ├⌬ GENOS AGREGADOS.*\n\n` +
        `> Usuario: @${who.split('@')[0]}\n` +
        `> Genos añadidos: *${cantidad}*\n` +
        `> Total: *${usuario.genos}*`,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.help = ['addgenos <cantidad>']
handler.tags = ['owner']
handler.command = ['addgenos']

handler.ownerOnly = true

export default handler