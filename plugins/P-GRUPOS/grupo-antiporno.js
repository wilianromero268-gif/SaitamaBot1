const handler = async (m, { args, groupDb }) => {
  const option = (args[0] || '').toLowerCase()

  if (!option) {
    return m.reply(`*⌬┤ 🔞 ├⌬ ANTIPORNO*

> Estado: ${groupDb.antiporno ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

> *Uso:*
> .antiporno on
> .antiporno off`)
  }

  if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {

    if (groupDb.antiporno) {
      return m.reply(`*⌬┤ ⚠️ ├⌬ YA ESTÁ ACTIVADO*

> El sistema antiporno ya estaba activado.`)
    }

    groupDb.antiporno = true
    await groupDb.save()

    return m.reply(`*⌬┤ ✅ ├⌬ ANTIPORNO ACTIVADO*

> Se detectarán automáticamente:

• 🖼️ Imágenes
• 🎞️ Videos
• 🧩 Stickers
• 🔗 Enlaces para adultos

> Primera infracción:
🗑️ Se eliminará el mensaje.

> Segunda infracción:
🚫 El usuario será expulsado.`)

  } else if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {

    if (!groupDb.antiporno) {
      return m.reply(`*⌬┤ ⚠️ ├⌬ YA ESTÁ DESACTIVADO*

> El sistema antiporno ya estaba desactivado.`)
    }

    groupDb.antiporno = false
    await groupDb.save()

    return m.reply(`*⌬┤ ❌ ├⌬ ANTIPORNO DESACTIVADO*

> Ya no se detectará contenido para adultos.`)

  } else {

    return m.reply(`*⌬┤ ❕ ├⌬ OPCIÓN INVÁLIDA*

> Usa:

> *.antiporno on*
> *.antiporno off*`)
  }
}

handler.help = ['antiporno <on/off>']
handler.tags = ['group']
handler.command = ['antiporno']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler