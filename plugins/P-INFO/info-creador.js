import PhoneNumber from 'awesome-phonenumber'
import config from '../../config.js'

const handler = async (m, { conn }) => {
  await m.react('📇')

  const ownerNum = (config.ownerNumber?.[0] || '51991579415').replace(/\D/g, '')
  const botNum = (conn.user?.id || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  
  const botName = config.botName || 'SAITAMA-BOT'
  const ownerName = config.ownerName || 'Owner'
  const region = config.ownerRegion || 'Perú¹⁴⁵'
  const email = config.ownerEmail || 'Saitama145@gmail.com'

  const contacts = [
    {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${ownerName};;;\nFN:${ownerName}\nORG:Creador de ${botName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${PhoneNumber('+' + ownerNum).getNumber('international')}\nEMAIL;type=INFORME:${email}\nADR:;;${region};;;;\nEND:VCARD`,
      displayName: ownerName
    },
    {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${botName};;;\nFN:${botName}\nORG:Bot Oficial\nTEL;type=CELL;type=VOICE;waid=${botNum}:${PhoneNumber('+' + botNum).getNumber('international')}\nEND:VCARD`,
      displayName: botName
    }
  ]

  await conn.sendMessage(m.chat, {
    contacts: { 
      displayName: `Creadores de ${botName}`, 
      contacts 
    }
  }, { quoted: m })
}

handler.help = ['creador']
handler.command = ['owner', 'creador', 'dueño', 'propietario', 'dono']
handler.tags = ['info']

export default handler