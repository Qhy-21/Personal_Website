// 使用 Upstash Redis REST API 持久化访客计数
// 所有实例共享同一份 Redis 数据，不再出现计数跳回的问题

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const REST_URL = process.env.UPSTASH_REDIS_REST_URL
  const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!REST_URL || !REST_TOKEN) {
    return fallbackMemory()
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    '0.0.0.0'

  let geo = { country: '未知', city: '未知' }
  try {
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city&lang=zh-CN`,
      { signal: AbortSignal.timeout(3000) },
    )
    if (geoRes.ok) {
      const data = await geoRes.json()
      if (data.status === 'success') geo = { country: data.country, city: data.city }
    }
  } catch {}

  const entry = JSON.stringify({
    country: geo.country,
    city: geo.city,
    time: new Date().toISOString(),
  })

  try {
    const redisRes = await fetch(`${REST_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', 'visitor:total'],
        ['LPUSH', 'visitor:entries', entry],
        ['LTRIM', 'visitor:entries', '0', '119'],
        ['LRANGE', 'visitor:entries', '0', '14'],
      ]),
      signal: AbortSignal.timeout(5000),
    })

    if (!redisRes.ok) throw new Error(`Redis HTTP ${redisRes.status}`)
    const results = await redisRes.json()

    const total = results[0]?.result || 0
    const recentRaw = results[3]?.result || []

    const recent = recentRaw.map((r) => {
      try { return JSON.parse(r) } catch { return { country: '未知', city: '未知', time: '' } }
    })

    const countryMap = {}
    recent.forEach((e) => {
      countryMap[e.country] = (countryMap[e.country] || 0) + 1
    })

    res.status(200).json({
      total,
      countries: Object.entries(countryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      recent,
    })
  } catch (err) {
    console.error('Redis error:', err)
    return fallbackMemory()
  }

  function fallbackMemory() {
    if (!fallbackMemory.store) {
      fallbackMemory.store = { total: 1286, entries: [] }
    }
    const s = fallbackMemory.store
    s.total++
    s.entries.unshift({ country: geo.country, city: geo.city, time: new Date().toISOString() })
    if (s.entries.length > 120) s.entries = s.entries.slice(0, 120)

    const countryMap = {}
    s.entries.forEach((e) => { countryMap[e.country] = (countryMap[e.country] || 0) + 1 })

    res.status(200).json({
      total: s.total,
      countries: Object.entries(countryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      recent: s.entries.slice(0, 15),
    })
  }
}
