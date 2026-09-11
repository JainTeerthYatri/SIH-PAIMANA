import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, secretKey } = await request.json()

    // 🔑 Read directly from environment variables (No Hardcoding)
    const ENV_EMAIL = process.env.SUPER_ADMIN_EMAIL
    const ENV_PASSWORD = process.env.SUPER_ADMIN_PASSWORD
    const ENV_SECRET = process.env.MOSPI_SUPER_ADMIN_SECRET

    if (!ENV_EMAIL || !ENV_PASSWORD || !ENV_SECRET) {
      return NextResponse.json(
        { error: 'SERVER CONFIG ERROR: Super Admin environment variables missing in .env.local' },
        { status: 500 }
      )
    }

    // 🛡️ Verify Super Admin Credentials
    const isEmailValid = email?.trim().toLowerCase() === ENV_EMAIL.toLowerCase()
    const isPasswordValid = password === ENV_PASSWORD
    const isSecretValid = !secretKey || secretKey === ENV_SECRET

    if (isEmailValid && isPasswordValid && isSecretValid) {
      const response = NextResponse.json(
        { message: 'GODMODE ACCESS GRANTED: Welcome Super Admin' },
        { status: 200 }
      )

      // 🍪 Set GodMode session cookie
      response.cookies.set('paimana_godmode', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 12, // 12 Hours
      })

      return response
    }

    return NextResponse.json(
      { error: 'UNAUTHORIZED: Invalid Super Admin Credentials or Master Secret.' },
      { status: 401 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}