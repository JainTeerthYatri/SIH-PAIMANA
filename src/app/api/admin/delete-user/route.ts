import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin Client using Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, secretKey } = body

    // 1️⃣ Verify Master Secret Key
    const expectedSecretKey = process.env.GODMODE_SECRET_KEY || process.env.NEXT_PUBLIC_GODMODE_SECRET_KEY

    if (!secretKey || secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Admin Secret Key.' },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 })
    }

    // 2️⃣ Delete user permanently from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'User account permanently deleted successfully.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
