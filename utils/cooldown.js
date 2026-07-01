export function checkCooldown(userDb, path, cooldownTime) {
  const now = Date.now()

  const last = userDb?.cooldowns?.[path] || 0
  const diff = now - last

  if (diff < cooldownTime) {
    const remaining = cooldownTime - diff

    return {
      ok: false,
      remaining,
      data: {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000)
      }
    }
  }

  return { ok: true, now }
}