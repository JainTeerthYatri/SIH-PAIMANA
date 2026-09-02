import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, secretKey } = await request.json()

    // 🛡️ STRICT FETCH: Sirf .env.local se data uthega, koi fallback nahi!
    const GOD_EMAIL = process.env.SUPER_ADMIN_EMAIL
    const GOD_PASS = process.env.SUPER_ADMIN_PASSWORD
    const GOD_SECRET = process.env.MOSPI_SUPER_ADMIN_SECRET

    // 🚨 FAIL-SAFE: Agar .env file theek se load nahi hui, toh API crash kara do par entry mat do
    if (!GOD_EMAIL || !GOD_PASS || !GOD_SECRET) {
      console.error("CRITICAL ERROR: Super Admin credentials missing in .env.local")
      return NextResponse.json(
        { error: 'System Configuration Error. Server Admin needs to check .env variables.' }, 
        { status: 500 }
      )
    }

    if (!email || !password || !secretKey) {
      return NextResponse.json({ error: 'All security fields are mandatory.' }, { status: 400 })
    }

    // Check 1: Exact Root Email & Password Match
    if (email !== GOD_EMAIL || password !== GOD_PASS) {
      return NextResponse.json(
        { error: 'ACCESS DENIED: Invalid Root Credentials.' }, 
        { status: 401 }
      )
    }

    // Check 2: Exact Master Secret Key Match
    if (secretKey !== GOD_SECRET) {
      return NextResponse.json(
        { error: 'SECURITY ALERT: Invalid Authorization Key.' }, 
        { status: 403 }
      )
    }

    // Agar teeno tests pass ho gaye, tabhi entry
    return NextResponse.json({ role: 'super_admin' }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}