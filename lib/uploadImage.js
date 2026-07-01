import axios from 'axios'
import FormData from 'form-data'

export async function uploadImage(buffer) {
  const form = new FormData()

  form.append('fileToUpload', buffer, 'image.jpg')
  form.append('reqtype', 'fileupload')

  const { data } = await axios.post(
    'https://catbox.moe/user/api.php',
    form,
    {
      headers: form.getHeaders()
    }
  )

  return data.trim()
}