// In-memory store (persists across warm invocations)
let store = {
  total: 1286,
  entries: [],
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

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
  } catch {
    /* ip-api unreachable — keep defaults */
  }

  store.total++
  store.entries.unshift({
    country: geo.country,
    city: geo.city,
    time: new Date().toISOString(),
  })
  if (store.entries.length > 120) store.entries = store.entries.slice(0, 120)

  const countryMap = {}
  store.entries.forEach((e) => {
    countryMap[e.country] = (countryMap[e.country] || 0) + 1
  })

  res.status(200).json({
    total: store.total,
    countries: Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    recent: store.entries.slice(0, 15),
  })
}
