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
      '> #delgenos 50'
    )
  }

  const usuario = await User.findOne({ jid: who })

  if (!usuario) {
    return m.reply(
      '*⌬┤ ❌ ├⌬ USUARIO NO ENCONTRADO.*'
    )
  }

  const genosActuales = usuario.genos || 0
  const genosEliminar = Math.min(cantidad, genosActuales)

  await User.updateOne(
    { jid: who },
    { $inc: { genos: -genosEliminar } }
  )

  usuario.genos -= genosEliminar

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*⌬┤ 🗑️ ├⌬ GENOS ELIMINADOS.*\n\n` +
        `> Usuario: @${who.split('@')[0]}\n` +
        `> Genos eliminados: *${genosEliminar}*\n` +
        `> Total actual: *${usuario.genos}*`,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.help = ['delgenos <cantidad>']
handler.tags = ['owner']
handler.command = ['delgenos']

// Solo el creador del bot
handler.ownerOnly = true

export default handler