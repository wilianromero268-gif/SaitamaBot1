import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { rm } from 'fs/promises'

const SEARCH =
'https://api.delirius.store/search/ytsearch'


function timeToSeconds(time = '') {
    const p = time.split(':').map(Number)

    if (p.length === 3)
        return p[0] * 3600 + p[1] * 60 + p[2]

    if (p.length === 2)
        return p[0] * 60 + p[1]

    return 0
}


function createBar(percent) {

    const total = 10
    const done = Math.floor(percent / 10)

    return (
        '█'.repeat(done) +
        '░'.repeat(total - done)
    )
}


const handler = async (m, { conn, text }) => {

if (!text)
return m.reply(
`╭━━━〔 🎬 VIDEO LARGO 〕━━━⬣
┃ Usa:
┃ #pelicula nombre
╰━━━━━━━━━━━━━━━━━━⬣`
)


let msg
let filePath


try {


const { data } = await axios.get(
`${SEARCH}?q=${encodeURIComponent(text)}`
)


const result =
data?.data?.find(
v => timeToSeconds(v.duration) >= 1800
)


if (!result)
return m.reply(
'❌ No se encontró un video largo'
)



msg = await conn.sendMessage(
m.chat,
{
image:{
url:result.thumbnail || result.image
},
caption:
`╭━━━〔 *🎬 PELICULA ENCONTRADO* 〕━━━⬣
┃ 🎬 Nombre:
┃ ${result.title}
┃
┃ ⏱️ Duración:
┃ ${result.duration}
╰━━━━━━━━━━━━━━━━━━⬣`
},
{quoted:m}
)



/*
Aquí va tu método autorizado
para obtener el enlace MP4
*/

const downloadUrl =
result.download



if(!downloadUrl)
throw Error(
'No hay enlace de descarga'
)



const dir='./tmp'

if(!fs.existsSync(dir))
fs.mkdirSync(dir)



filePath =
path.join(
dir,
`video_${Date.now()}.mp4`
)



const res =
await axios.get(
downloadUrl,
{
responseType:'stream'
}
)


const total =
Number(
res.headers['content-length'] || 0
)


let current = 0
let old = -1



res.data.on(
'data',
async chunk=>{

current += chunk.length


if(!total)
return


const percent =
Math.floor(
(current / total) * 100
)


if(percent !== old &&
percent % 5 === 0){

old = percent


await conn.sendMessage(
m.chat,
{
text:
`╭━━━〔 🎬 DESCARGANDO VIDEO 〕━━━⬣
┃ 🎬 Nombre:
┃ ${result.title}
┃ ⏱️ Duración:
┃ ${result.duration}
┃
┃ 📥 Descargando...
┃ ${createBar(percent)} ${percent}%
┃ 💾 ${(current/1024/1024).toFixed(2)}
┃ MB / ${(total/1024/1024).toFixed(2)} MB
╰━━━━━━━━━━━━━━━━━━⬣`,
edit:msg.key
}
)

}

})



await pipeline(
res.data,
fs.createWriteStream(filePath)
)



await conn.sendMessage(
m.chat,
{
text:
`╭━━━〔 ✅ VIDEO DESCARGADO 〕━━━⬣
┃ 🎬 Nombre:
┃ ${result.title}
┃ ⏱️ Duración:
┃ ${result.duration}
┃ 💾 Tamaño:
┃ ${(total/1024/1024).toFixed(2)} MB
┃ 📤 Enviando archivo...
╰━━━━━━━━━━━━━━━━━━⬣`,
edit:msg.key
}
)



await conn.sendMessage(
m.chat,
{
document:
fs.readFileSync(filePath),

mimetype:
'video/mp4',

fileName:
`${result.title}.mp4`,

caption:
`ѕαιтαмαвσт

🎬 ${result.title}
⏱️ ${result.duration}`
},
{quoted:m}
)



}catch(e){

console.log(e)

m.reply(
`❌ Error:
${e.message}`
)

}
finally{

if(filePath)
await rm(
filePath,
{force:true}
).catch(()=>{})

}

}


handler.command=[
'pelicula',
'peliculas',
'pldl',
'pl',
]

handler.tags=[
'descargas'
]

handler.help=[
'pelicula <texto>'
]


export default handler
