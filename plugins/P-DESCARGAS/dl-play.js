import axios from 'axios'
import config from '../../config.js'

global.youtubeCache = global.youtubeCache || {}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {

    // SIGUIENTE RESULTADO
    if (command === 'playnext') {
      const dataUser = global.youtubeCache[m.sender]

      if (!dataUser || !dataUser.results?.length) {
        return m.reply('*『 ❌ 』No hay una búsqueda activa.*')
      }

      dataUser.index++

      if (dataUser.index >= dataUser.results.length) {
        dataUser.index = 0
      }

      return sendYoutubeCard(
        conn,
        m,
        dataUser.results,
        dataUser.index,
        usedPrefix
      )
    }

    if (!text) {
      return m.reply(
        `*『 ✙ 』USO.*\n` +
        `> Ingresa el nombre de una canción o video.\n\n` +
        `> *Ejemplo:* ${usedPrefix}play Twice`
      )
    }

    await m.reply('🔍 Buscando información...')

    let videos = []

    // API PRINCIPAL (DELIRIUS)
    try {
      const { data } = await axios.get(
        `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(text)}`
      )

      if (data?.status && data?.data?.length) {
        videos = data.data.map(v => ({
          title: v.title,
          author: v.author?.name || 'Desconocido',
          duration: v.duration,
          views: v.views,
          publishedAt: v.publishedAt,
          videoId: v.videoId,
          thumbnail: v.thumbnail || v.image,
          url: v.url
        }))
      }

    } catch {}

    // API SECUNDARIA (LUXINFINITY)
    if (!videos.length) {
      try {
        const { data } = await axios.get(
          `https://luxinfinity.vercel.app/api/search/youtube?query=${encodeURIComponent(text)}&limit=10`
        )

        if (data?.status && data?.data?.length) {
          videos = data.data.map(v => ({
            title: v.title,
            author: v.author?.name || 'Desconocido',
            duration: v.duration?.text || 'Desconocido',
            views: v.views,
            publishedAt: v.publishDate,
            videoId: v.id,
            thumbnail: v.thumb,
            url: v.url
          }))
        }

      } catch {}
    }

    if (!videos.length) {
      return m.reply(
        '*『 ✙ 』ERROR.*\n> No se encontraron resultados.'
      )
    }

    global.youtubeCache[m.sender] = {
      query: text,
      index: 0,
      results: videos
    }

    await sendYoutubeCard(
      conn,
      m,
      videos,
      0,
      usedPrefix
    )

  } catch (e) {
    console.error(e)

    m.reply(
      '*『 ✙ 』ERROR.*\n> No se pudo obtener la información del video.'
    )
  }
}

async function sendYoutubeCard(conn, m, results, index, usedPrefix) {
  const video = results[index]

  const infoText =
`*『 🎬 』YOUTUBE SEARCH*

> *Título:* ${video.title}
> *Autor:* ${video.author}
> *Duración:* ${video.duration}
> *Vistas:* ${video.views}
> *Publicado:* ${video.publishedAt}

> *Resultado:* ${index + 1}/${results.length}

> *Elige un formato:*`

  const buttons = [
    {
      text: 'Elegir formato ⚙️',
      sections: [
        {
          title: '✧ Descargas ✧',
          rows: [
            {
              title: '🎧 Audio MP3',
              description: 'Descargar audio',
              id: `${usedPrefix}ytmp3 ${video.videoId}`
            },
            {
              title: '📁 Audio Documento',
              description: 'Descargar audio como documento',
              id: `${usedPrefix}ytmp3doc ${video.videoId}`
            },
            {
              title: '🎥 Video MP4',
              description: 'Descargar video',
              id: `${usedPrefix}ytmp4 ${video.url}`
            },
            {
              title: '📂 Video Documento',
              description: 'Descargar video como documento',
              id: `${usedPrefix}ytmp4doc ${video.url}`
            },
            {
              title: '➡️ Siguiente búsqueda',
              description: `Mostrar resultado ${index + 2 > results.length ? 1 : index + 2}/${results.length}`,
              id: `${usedPrefix}playnext`
            }
          ]
        }
      ]
    }
  ]

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: video.thumbnail
      },
      caption: infoText,
      footer: global.botname || config.botName,
      buttons
    },
    {
      quoted: m
    }
  )
}

handler.help = [
  'play <texto>',
  'playnext'
]

handler.tags = ['descargas']

handler.command = [
  'play',
  'play2',
  'play3',
  'playnext'
]

export default handler