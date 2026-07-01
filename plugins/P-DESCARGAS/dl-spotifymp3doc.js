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
    await m.reply('📁 Descargando documento de Spotify...')

    const { data } = await axios.get(
      `https://luxinfinity.vercel.app/api/spotify?url=${encodeURIComponent(text)}`
    )

    if (!data?.status || !data?.data?.mp3) {
      throw new Error('No se pudo obtener el audio')
    }

    const song = data.data

    const caption =
`*『 📁 』SPOTIFY DOCUMENTO*

> *Título:* ${song.name}
> *Artista:* ${song.artist}
> *Álbum:* ${song.album}
> *Duración:* ${song.duration}
> *Año:* ${song.year}`

    await conn.sendMessage(
      m.chat,
      {
        document: {
          url: song.mp3
        },
        mimetype: 'audio/mpeg',
        fileName: `${song.name}.mp3`,
        caption
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)

    m.reply(
      '*『 ❌ 』ERROR.*\n' +
      '> No se pudo descargar el documento.'
    )
  }
}

handler.help = ['spotifymp3doc <url>']
handler.tags = ['descargas']
handler.command = ['spotifymp3doc']

export default handler