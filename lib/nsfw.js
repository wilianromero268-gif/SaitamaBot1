import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import { SIGHTENGINE_USER, SIGHTENGINE_SECRET } from './keys.js'

export async function checkNSFW(file) {
  try {
    const form = new FormData()

    form.append('media', fs.createReadStream(file))
    form.append('models', 'nudity-2.1')
    form.append('api_user', SIGHTENGINE_USER)
form.append('api_secret', SIGHTENGINE_SECRET)

    const { data } = await axios.post(
      'https://api.sightengine.com/1.0/check.json',
      form,
      {
        headers: form.getHeaders()
      }
    )

    const nudity = data.nudity || {}

    const score = Math.max(
      nudity.sexual_activity || 0,
      nudity.sexual_display || 0,
      nudity.erotica || 0,
      nudity.very_suggestive || 0
    )

    return {
      success: true,
      isPorn: score >= 0.70,
      score,
      data
    }

  } catch (e) {
    return {
      success: false,
      isPorn: false,
      error: e
    }
  }
}