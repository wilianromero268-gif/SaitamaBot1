import axios from 'axios'
import NodeID3 from 'node-id3'

export async function writeAudioTags(filePath, media) {
  try {
    let cover = null

    if (media.image) {
      const { data } = await axios.get(media.image, {
        responseType: 'arraybuffer'
      })

      cover = Buffer.from(data)
    }

    NodeID3.write({
      title: media.title || 'Audio',
      artist: media.author || 'Desconocido',
      album: 'ʏσυтυʙє | ѕαιтαмαвσт',
      image: cover && {
        mime: 'image/jpeg',
        type: {
          id: 3,
          name: 'front cover'
        },
        description: media.title,
        imageBuffer: cover
      }
    }, filePath)

    return true
  } catch (e) {
    console.error('[AudioTags]', e)
    return false
  }
        }
