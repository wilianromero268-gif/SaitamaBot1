import { getSubBotMeta, saveSubBotMeta } from '../../lib/jadibot.js'

const handler = async (m, { conn: zen, args, usedPrefix, command }) => {

if (!zen.isSubBot)
return m.reply(
`⚠️ Este comando solo funciona en Sub-Bots`
)


const sender = m.sender.replace(/\D/g,'')
const owner = zen.ownerNumber.replace(/\D/g,'')


if (sender !== owner)
return m.reply(
`❌ Solo el dueño del Sub-Bot puede cambiar el idioma`
)


const idioma = args[0]?.toLowerCase()


const idiomas = {

es: "🇪🇸 Español",

en: "🇺🇸 Inglés",

fr: "🇫🇷 Francés",

no: "🇳🇴 Noruego",

de: "🇩🇪 Alemán",

it: "🇮🇹 Italiano",

pt: "🇧🇷 Portugués",

ru: "🇷🇺 Ruso",

ja: "🇯🇵 Japonés",

ko: "🇰🇷 Coreano",

zh: "🇨🇳 Chino",

ar: "🇸🇦 Árabe",

nl: "🇳🇱 Holandés",

tr: "🇹🇷 Turco",

id: "🇮🇩 Indonesio"

}



if (!idioma || !idiomas[idioma]) {

return m.reply(
`🌐 Idiomas disponibles:

${Object.entries(idiomas)
.map(([c,n])=>`${n} (${c})`)
.join('\n')}


Ejemplo:

${usedPrefix}${command} en`
)

}



const meta = await getSubBotMeta()


if (!meta[zen.ownerNumber])
meta[zen.ownerNumber] = {}



meta[zen.ownerNumber].language = idioma


await saveSubBotMeta(meta)



m.reply(
`✅ Idioma cambiado

🌐 Nuevo idioma:
${idiomas[idioma]}`
)


}


handler.command = [
'idioma',
'language',
'setlang'
]

handler.tags = [
'jadibot'
]

handler.help = [
'idioma <codigo>'
]

handler.noRegister = true


export default handler
