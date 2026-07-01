import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const getMedal = (i) => {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return `*${i + 1}.*`
}

const handler = async (m, { conn, userDb }) => {
  if (!userDb) return

  const [topCoins, topGenos, posCoins, posGenos, allReg] = await Promise.all([
    User.find({ registered: true, genosCoins: { $gt: 0 } }, { jid: 1, genosCoins: 1, name: 1 }).sort({ genosCoins: -1 }).limit(10).lean(),
    User.find({ registered: true, genos:    { $gt: 0 } }, { jid: 1, genos: 1, name: 1    }).sort({ genos:    -1 }).limit(10).lean(),
    User.countDocuments({ registered: true, genosCoins: { $gt: userDb.genosCoins } }),
    User.countDocuments({ registered: true, genos:    { $gt: userDb.genos    } }),
    User.find({ registered: true }, { genosCoins: 1, genos: 1 }).lean()
  ])

  const totalCoins = allReg.reduce((sum, u) => sum + (u.genosCoins || 0), 0)
  const totalGenos = allReg.reduce((sum, u) => sum + (u.genos || 0), 0)

  let txt = `*╔═══⌦ ✦ 🏆 RANKING GLOBAL ✦ ⌫═══╗*\n\n`

  if (topCoins.length > 0) {
    txt += `*⌬┤ ${config.CURRENCY_SYMBOL} RICOS EN ${config.CURRENCY_NAME.toUpperCase()} ├⌬*\n`
    topCoins.forEach((u, i) => {
      const medal = getMedal(i)
      const name = u.name || 'Invitado'
      txt += `> ${medal} ${name} (@${u.jid.split('@')[0]}) — ${u.genosCoins.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}\n`
    })
    txt += '\n'
  }

  if (topGenos.length > 0) {
    txt += `*⌬┤ ${config.PREMIUM_SYMBOL} MAESTROS EN ${config.PREMIUM_NAME.toUpperCase()} ├⌬*\n`
    topGenos.forEach((u, i) => {
      const medal = getMedal(i)
      const name = u.name || 'Invitado'
      txt += `> ${medal} ${name} (@${u.jid.split('@')[0]}) — ${u.genos.toLocaleString('es-AR')} ${config.PREMIUM_SYMBOL}\n`
    })
    txt += '\n'
  }

  if (topCoins.length === 0 && topGenos.length === 0) {
    txt += `> _Aún no hay usuarios registrados en el ranking._\n\n`
  }

  txt += `*⌬┤ 📉 ESTADÍSTICAS DE CIRCULANTE ├⌬*\n`
  txt += `> 🪙 Circulante de ${config.CURRENCY_NAME}: ${totalCoins.toLocaleString('es-AR')} ${config.CURRENCY_SYMBOL}\n`
  txt += `> ${config.PREMIUM_SYMBOL} Circulante de ${config.PREMIUM_NAME}: ${totalGenos.toLocaleString('es-AR')} ${config.PREMIUM_SYMBOL}\n\n`

  txt += `*━━━━━━━━━━━━━━━━━━━━*\n*📊 TU ESTADO ACTUAL:*\n`
  txt += `> ${config.CURRENCY_SYMBOL} *${config.CURRENCY_NAME}:* Puesto #${posCoins + 1}\n`
  txt += `> ${config.PREMIUM_SYMBOL} *${config.PREMIUM_NAME}:* Puesto #${posGenos + 1}\n`
  txt += `*╚══⌦ ${config.footer} ⌫══╝*`

  const allMentions = [...new Set([...topCoins.map(u => u.jid), ...topGenos.map(u => u.jid)])]
  conn.sendMessage(m.chat, { text: txt, mentions: allMentions }, { quoted: m })
}

handler.help    = ['leaderboard']
handler.tags    = ['eco']
handler.command = ['lb', 'topcoins', 'topgenoss', 'leaderboard', 'ricos']
handler.register = true
export default handler