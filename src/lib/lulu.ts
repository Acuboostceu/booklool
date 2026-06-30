const LULU_API = 'https://api.lulu.com'
const TOKEN_URL = 'https://api.lulu.com/auth/realms/glasstree/protocol/openid-connect/token'

let cachedToken: { value: string; expiresAt: number } | null = null

export async function getLuluToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.LULU_CLIENT_KEY!,
      client_secret: process.env.LULU_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Lulu auth failed: ${text}`)
  }

  const data = await res.json()
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cachedToken.value
}

export async function luluFetch(path: string, options: RequestInit = {}) {
  const token = await getLuluToken()
  const res = await fetch(`${LULU_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return res
}

// 책 사양 — 8.5x8.5 컬러 소프트커버
export const BOOK_SPEC = {
  pod_package_id: '0850X0850FCSTDPB060UW444MXX',
}
