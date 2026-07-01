import User from '../lib/database/models/zen-users.js'

export async function setCooldown(jid, path, time) {
  await User.updateOne(
    { jid },
    { $set: { [`cooldowns.${path}`]: time } }
  )
}