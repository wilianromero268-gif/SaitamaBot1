import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*『 📌 』USO DEL COMANDO*\n\n` +
      `> Ejemplo:\n` +
      `> ${usedPrefix + command} Sakura`
    )
  }

  try {
    await m.reply('🔍 Buscando imágenes en Pinterest...')

    const { data } = await axios.get(
      `https://luxinfinity.vercel.app/api/search/pinterest?query=${encodeURIComponent(text)}&limit=10`
    )

    if (!data?.status || !data?.data?.length) {
      return m.reply(
        '*『 ❌ 』No se encontraron resultados.*'
      )
    }

    const results = data.data.slice(0, 10)

    // Crear el álbum
    const album = results.map((img, index) => ({
      image: { url: img.image },
      caption:
        index === 0
          ? `*『 📌 』PINTEREST SEARCH*\n\n` +
            `> *Búsqueda:* ${text}\n` +
            `> *Resultados:* ${results.length}\n\n` +
            `> ✨ Álbum generado por SaitamaBot`
          : ''
    }))

    // Enviar álbum
    await conn.sendMessage(
      m.chat,
      {
        album
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)

    m.reply(
  '*『✅』Completado.*\n' +
  '> Se pudieron obtener las imágenes.'
)
  }
}

handler.help = ['pin <texto>', 'pinterest <texto>']
handler.tags = ['descargas']
handler.command = ['pin', 'pinterest']

export default handler