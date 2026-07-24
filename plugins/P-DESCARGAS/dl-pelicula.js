import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { rm } from 'fs/promises'


const SEARCH =
'https://api.delirius.store/search/ytsearch'


const DOWNLOAD =
'https://api.delirius.store/download/ytmp4'



function timeToSeconds(time = '') {

    const p = time.split(':').map(Number)

    if (p.length === 3)
        return p[0] * 3600 + p[1] * 60 + p[2]

    if (p.length === 2)
        return p[0] * 60 + p[1]

    return 0
}



function createBar(percent){

    const total = 10
    const done = Math.floor(percent / 10)

    return (
        '█'.repeat(done) +
        '░'.repeat(total - done)
    )
}



const handler = async (m,{conn,text})=>{


if(!text){

return m.reply(
`╭━━━〔 *🎬 PELÍCULA*〕━━━⬣
┃ Usa:
┃ #pelicula nombre
╰━━━━━━━━━━━━━━━━━━⬣`
)

}



let msg
let filePath



try{


// BUSCAR

const search = await axios.get(
`${SEARCH}?q=${encodeURIComponent(text)}`
)


const result =
search.data?.data?.find(
v => timeToSeconds(v.duration) >= 3600
)



if(!result){

return m.reply(
'❌ No encontré un video mayor a 1 hora'
)

}



// MENSAJE INICIAL

msg = await conn.sendMessage(
m.chat,
{
image:{
url:result.thumbnail || result.image
},
caption:
`╭━━━〔 *🎬 PELÍCULA ENCONTRADO* 〕━━━⬣
┃ 🎬 Nombre:
┃ ${result.title}
┃
┃ ⏱️ Duración:
┃ ${result.duration}
╰━━━━━━━━━━━━━━━━━━⬣`
},
{quoted:m}
)




// OBTENER DESCARGA

const down = await axios.get(
`${DOWNLOAD}?url=${encodeURIComponent(result.url)}&format=360p`
)



const media = down.data?.data



if(!media?.download){

throw Error(
'La API no devolvió enlace MP4'
)

}



const downloadUrl = media.download



// CREAR TEMP

const dir='./tmp'


if(!fs.existsSync(dir)){

fs.mkdirSync(dir,{recursive:true})

}



filePath = path.join(
dir,
`video_${Date.now()}.mp4`
)




// DESCARGA STREAM

const res = await axios.get(
downloadUrl,
{
responseType:'stream',
timeout:120000
}
)



const total = Number(
    res.headers['content-length'] ||
    res.headers['Content-Length'] ||
    0
)

let current = 0
let lastPercent = -1
let lastUpdate = 0


res.data.on('data', chunk => {

    current += chunk.length

})


const progress = setInterval(async () => {

    if (!total) return


    const percent = Math.floor(
        (current / total) * 100
    )


    if (percent === lastPercent) return


    if (Date.now() - lastUpdate < 3000) return


    lastPercent = percent
    lastUpdate = Date.now()


    await conn.sendMessage(
    m.chat,
    {
    text:
`╭━━━〔 *🎬 DESCARGANDO PELÍCULA* 〕━━━⬣
┃ *🎬 Nombre:*
┃ ${result.title}
┃ *⏱️ Duración:*
┃ ${result.duration}
┃
┃ *📥 Descargando...*
┃ ${createBar(percent)} ${percent}%
┃ 💾 ${(current/1024/1024).toFixed(2)} MB / ${(total/1024/1024).toFixed(2)} MB
╰━━━━━━━━━━━━━━━━━━⬣`,
    edit: msg.key
    }
    )


},3000)



await pipeline(
    res.data,
    fs.createWriteStream(filePath)
)


clearInterval(progress)




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

console.log(
'[VIDEOLARGO]',
e
)


m.reply(
`❌ Error:
${e.message}`
)


}
finally{


if(filePath){

await rm(
filePath,
{force:true}
).catch(()=>{})

}


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
