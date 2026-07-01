import { getSubBotMeta, saveSubBotMeta } from '../../lib/jadibot.js'
import { uploadImage } from '../../lib/uploadImage.js'

const handler = async (m, { conn: zen, usedPrefix, command }) => {
  if (!zen.isSubBot) {
    return m.reply(
      `*⌬┤ ⚠️ ├⌬ SOLO SUB-BOTS*\n> Este comando es exclusivo para dueños de Sub-Bots.`
    )
  }

  const senderNumber = m.sender.replace(/\D/g, '')
  const ownerNumber = zen.ownerNumber.replace(/\D/g, '')

  const normalizar = (n) => {
    let x = n.replace(/\D/g, '')
    if (x.startsWith('549')) x = '54' + x.slice(3)
    if (x.startsWith('521')) x = '52' + x.slice(3)
    return x
  }

  if (normalizar(senderNumber) !== normalizar(ownerNumber)) {
    return m.reply(
      `*⌬┤ ❌ ├⌬ SIN PERMISOS*\n> Solo el creador de este sub-bot (+${zen.ownerNumber}) puede cambiar la imagen del menú.`
    )
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/i.test(mime)) {
    return m.reply(
      `*⌬┤ ℹ️ ├⌬ USO CORRECTO*\n> Respondé a una imagen y usa:\n> *${usedPrefix}${command}*`
    )
  }

  try {
    const buffer = await q.download()

    if (!buffer) {
      return m.reply(
        `*⌬┤ ❌ ├⌬ ERROR*\n> No se pudo descargar la imagen.`
      )
    }

    await m.reply(`*⌬┤ ⏳ ├⌬ SUBIENDO IMAGEN...*`)

    const url = await uploadImage(buffer)

    zen.menuImage = url

    const meta = await getSubBotMeta()

    if (!meta[zen.ownerNumber]) {
      meta[zen.ownerNumber] = {}
    }

    meta[zen.ownerNumber].menuImage = url

    await saveSubBotMeta(meta)

    m.reply(
      `*⌬┤ ✅ ├⌬ ÉXITO*\n` +
      `> La imagen del menú fue actualizada correctamente.\n` +
      `> Usá *${usedPrefix}menu* para ver el cambio.`
    )

  } catch (e) {
    console.error(e)

    m.reply(
      `*⌬┤ ❌ ├⌬ ERROR*\n> ${e.message}`
    )
  }
}

handler.help = ['setbotimage']
handler.tags = ['jadibot']
handler.command = ['setbotimage', 'setfotobot', 'imagebot']
handler.noRegister = true

export default handler