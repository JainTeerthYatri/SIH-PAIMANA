export function getDynamic2FACode(): string {
  // 1. Get current time converted specifically to Indian Standard Time (IST)
  const now = new Date()
  const istTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const istTime = new Date(istTimeStr)

  // 2. Extract Date components
  const year = istTime.getFullYear()
  const month = istTime.getMonth() + 1
  const date = istTime.getDate()
  const dateStr = `${year}-${month}-${date}`

  // 3. Extract Hour (0-23) and divide by 6 to get the chunk (0, 1, 2, or 3)
  const currentHour = istTime.getHours()
  const timeChunk = Math.floor(currentHour / 6) 

  // 🛡️ STRICT ENV FETCH: No hardcoded string anymore!
  const masterSecret = process.env.NEXT_PUBLIC_2FA_SECRET
  
  // 🚨 FAIL-SAFE: Agar .env theek se load nahi hui, toh error de do
  if (!masterSecret) {
    console.error("CRITICAL: 2FA Secret Seed is missing in .env.local")
    return "000000" // Fails the login check automatically
  }
  
  // 4. Create a unique seed
  const combinedSeed = `${dateStr}-CHUNK-${timeChunk}-${masterSecret}`
  
  // 5. Custom Hashing Algorithm
  let hash = 0
  for (let i = 0; i < combinedSeed.length; i++) {
    hash = ((hash << 5) - hash) + combinedSeed.charCodeAt(i)
    hash |= 0 
  }
  
  // 6. Return a strictly 6-digit code
  return Math.abs(hash).toString().substring(0, 6).padStart(6, '8')
}