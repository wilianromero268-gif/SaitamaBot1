const handler = async (m, { args, groupDb }) => {
  const option = (args[0] || '').toLowerCase()

  if (!option) {
    return m.reply(`╭━━━〔 📞 ANTILLAMADAS 〕━━━⬣

> Estado: ${groupDb.antiCall ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}

📌 Uso:

• .antillamadas on
• .antillamadas off

╰━━━━━━━━━━━━━━━━━━⬣`)
  }

  if (['on', '1', 'true', 'activar', 'enable'].includes(option)) {

    if (groupDb.antiCall) {
      return m.reply(`⚠️ El sistema *Antillamadas* ya estaba activado.`)
    }

    groupDb.antiCall = true
    await groupDb.save()

    return m.reply(`╭━━━〔 ✅ ANTILLAMADAS 〕━━━⬣

El sistema ha sido activado correctamente.

Ahora el bot:

📞 Rechazará cualquier llamada.

🚫 Expulsará automáticamente al usuario que llame al bot (si el bot es administrador).

👑 El Owner no será expulsado.

╰━━━━━━━━━━━━━━━━━━⬣`)
  }

  if (['off', '0', 'false', 'desactivar', 'disable'].includes(option)) {

    if (!groupDb.antiCall) {
      return m.reply(`⚠️ El sistema *Antillamadas* ya estaba desactivado.`)
    }

    groupDb.antiCall = false
    await groupDb.save()

    return m.reply(`╭━━━〔 ❌ ANTILLAMADAS 〕━━━⬣

El sistema ha sido desactivado.

El bot ya no expulsará usuarios por realizar llamadas.

╰━━━━━━━━━━━━━━━━━━⬣`)
  }

  return m.reply(`❌ Opción inválida.

Usa:

.antillamadas on
.antillamadas off`)
}

handler.help = ['antillamadas <on/off>']
handler.tags = ['group']
handler.command = ['antillamadas', 'antiCall']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true

export default handler