import axios from 'axios'
import config from '../../config.js'

global.spotifyCache = global.spotifyCache || {}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Comando para mostrar el siguiente resultado
    if (command === 'spotifynext') {
      const dataUser = global.spotifyCache[m.sender]

      if (!dataUser || !dataUser.results?.length) {
        return m.reply('*『 ❌ 』No hay una búsqueda activa.*')
      }

      dataUser.index++

      if (dataUser.index >= dataUser.results.length) {
        dataUser.index = 0
      }

      return await sendSpotifyCard(
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
        `> Ingresa el nombre de una canción.\n\n` +
        `> *Ejemplo:* ${usedPrefix}spotify Twice`
      )
    }

    await m.reply('🔍 Buscando canciones en Spotify...')

    const { data } = await axios.get(
      `https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=10`
    )

    if (!data?.status || !data?.data?.length) {
      return m.reply('*『 ❌ 』No se encontraron resultados.*')
    }

    global.spotifyCache[m.sender] = {
      query: text,
      index: 0,
      results: data.data
    }

    await sendSpotifyCard(
      conn,
      m,
      data.data,
      0,
      usedPrefix
    )

  } catch (e) {
    console.error(e)

    m.reply(
      '*『 ✙ 』ERROR.*\n' +
      '> No se pudo obtener la información.'
    )
  }
}

async function sendSpotifyCard(conn, m, results, index, usedPrefix) {
  const song = results[index]

  const infoText =
`*『 🎧 』SPOTIFY SEARCH*

> *Título:* ${song.title}
> *Artista:* ${song.artist}
> *Álbum:* ${song.album}
> *Duración:* ${song.duration}
> *Publicado:* ${song.publish}
> *Popularidad:* ${song.popularity}

> *Resultado:* ${index + 1}/${results.length}

> *Elige una opción:*`

  const buttons = [
    {
      text: 'Opciones ⚙️',
      sections: [
        {
          title: '✧ Spotify ✧',
          rows: [
            {
              title: '🎵 Audio MP3',
              description: 'Próximamente',
              id: `${usedPrefix}spotifymp3 ${song.url}`
            },
            {
              title: '📁 Audio Documento',
              description: 'Próximamente',
              id: `${usedPrefix}spotifymp3doc ${song.url}`
            },
            {
              title: '🎧 Escuchar en Spotify',
              description: 'Abrir enlace oficial',
              id: `${usedPrefix}spotifyopen ${song.url}`
            },
            {
              title: '➡️ Otra canción',
              description: `Mostrar resultado ${index + 2 > results.length ? 1 : index + 2}`,
              id: `${usedPrefix}spotifynext`
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
        url: song.image
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
  'spotify <texto>',
  'spotifynext'
]

handler.tags = ['descargas']

handler.command = [
  'spotify',
  'sp',
  'spotifynext'
]

export default handler