import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*『 ✙ 』USO.*\n` +
      `> Ejemplo:\n` +
      `> ${usedPrefix + command} https://open.spotify.com/track/...`
    )
  }

  try {
    await m.reply('🎵 Descargando audio de Spotify...')

    const { data } = await axios.get(
      `https://luxinfinity.vercel.app/api/spotify?url=${encodeURIComponent(text)}`
    )

    if (!data?.status || !data?.data?.mp3) {
      throw new Error('No se pudo obtener el audio')
    }

    const song = data.data

    const caption =
`*『 🎧 』SPOTIFY MP3*

> *Título:* ${song.name}
> *Artista:* ${song.artist}
> *Álbum:* ${song.album}
> *Duración:* ${song.duration}
> *Año:* ${song.year}`

    await conn.sendMessage(
      m.chat,
      {
        audio: {
          url: song.mp3
        },
        mimetype: 'audio/mpeg',
        fileName: `${song.name}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: song.name,
            body: song.artist,
            thumbnailUrl: song.cover,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: text
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)

    m.reply(
      '*『 ❌ 』ERROR.*\n' +
      '> No se pudo descargar el audio.'
    )
  }
}

handler.help = ['spotifymp3 <url>']
handler.tags = ['descargas']
handler.command = ['spotifymp3']

export default handler