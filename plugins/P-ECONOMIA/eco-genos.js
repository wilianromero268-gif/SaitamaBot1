import User from '../../lib/database/models/zen-users.js'
import { checkCooldown } from '../../utils/cooldown.js'
import { setCooldown } from '../../utils/setCooldown.js'

const COOLDOWN = 7 * 24 * 60 * 60 * 1000

const handler = async (m, { userDb }) => {

  if (!userDb?.registered) {
    return m.reply('🔒 Regístrate primero.')
  }

  // 🧠 seguridad anti errores usuarios viejos
  if (!userDb.cooldowns) userDb.cooldowns = {}

  const cd = checkCooldown(userDb, 'entrenamientoGenos', COOLDOWN)

  if (!cd.ok) {
    return m.reply(
      `⏳ EN DESCANSO\n\n` +
      `Vuelve en: ${cd.data.days}d ${cd.data.hours}h ${cd.data.minutes}m`
    )
  }

  const recompensa = Math.floor(Math.random() * 16) + 5

  await User.updateOne(
    { jid: m.sender },
    { $inc: { genos: recompensa } }
  )

  await setCooldown(m.sender, 'entrenamientoGenos', Date.now())

  return m.reply(
    `🤖 ENTRENAMIENTO COMPLETADO\n\n+${recompensa} Genos`
  )
}

handler.command = ['entrenargenos']
export default handler