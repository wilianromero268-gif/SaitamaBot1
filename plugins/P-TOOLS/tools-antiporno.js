import fs from 'fs'
import User from '../../lib/database/models/zen-users.js'
import GroupDb from '../../lib/database/models/zen-groups.js'
import { checkNSFW } from '../../lib/nsfw.js'

const handler = async (m, { conn }) => {

  // Solo grupos
  if (!m.isGroup) return

  // Configuración del grupo
  const group = await GroupDb.findOne({ jid: m.chat })
  if (!group?.antiPorno) return

  // Solo imágenes, videos o stickers
  const type = m.mtype
  if (
    type !== 'imageMessage' &&
    type !== 'videoMessage' &&
    type !== 'stickerMessage'
  ) return

  // Descargar archivo
  const file = await m.download()

  // Revisar con SightEngine
  const result = await checkNSFW(file)

  // No es porno
  if (!result.isPorn) return

  // Buscar usuario
  const user = await User.findOne({ jid: m.sender })

  // Eliminar mensaje
  await conn.sendMessage(m.chat, {
    delete: m.key
  })

  // Sumar advertencia
  user.pornoWarns++
  await user.save()

  // Expulsar si llegó al límite
  if (user.pornoWarns >= 3) {

    await conn.groupParticipantsUpdate(
      m.chat,
      [m.sender],
      'remove'
    )

    return conn.sendMessage(m.chat, {
      text: '🚫 Usuario expulsado por enviar contenido pornográfico repetidamente.'
    })
  }

  // Aviso
  return conn.sendMessage(m.chat, {
    text: `⚠️ Contenido NSFW eliminado.\nAdvertencias: ${user.pornoWarns}/3`
  })
}

handler.all = true

export default handler