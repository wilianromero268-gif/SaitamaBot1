import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Jimp } from 'jimp'

const handler = async (m, { conn }) => {
  const msg = m.quoted || m
  const mtype = msg.mtype

  if (mtype !== 'imageMessage') {
    return m.reply(
      `*⌬┤ ⚠️ ├⌬ IMAGEN REQUERIDA.*\n> Respondé una imagen para usarla como foto del grupo.`
    )
  }

  try {
    const imageMsg = msg.message?.imageMessage || msg.msg
    const stream = await downloadContentFromMessage(imageMsg, 'image')

    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    const img = await Jimp.read(buffer)

    const width = img.bitmap.width
    const height = img.bitmap.height
    const size = Math.min(width, height)

    img.crop({
      x: (width - size) / 2,
      y: (height - size) / 2,
      w: size,
      h: size
    })

    img.resize({
      w: 640,
      h: 640
    })

    const finalBuffer = await img.getBuffer('image/jpeg')

    await conn.updateProfilePicture(m.chat, finalBuffer)

    m.reply(
      `*⌬┤ ✅ ├⌬ FOTO ACTUALIZADA.*\n▢ La foto del grupo fue cambiada correctamente.`
    )

  } catch (e) {
    console.error(e)

    m.reply(
      `*⌬┤ ❌ ├⌬ ERROR.*\n> ${e.message}`
    )
  }
}

handler.help = ['fotog']
handler.tags = ['group']
handler.command = ['fotog', 'setfoto', 'groupfoto']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler