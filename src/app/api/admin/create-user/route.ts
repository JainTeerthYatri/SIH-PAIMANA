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
    const { email, password, role, monthlyCode } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required fields.' },
        { status: 400 }
      )
    }

    const targetRole = role || 'officer'

    // 1️⃣ Generate 8-Digit Cipher for Admin if not provided
    let finalMonthlyCode = monthlyCode
    if (targetRole === 'admin' && !finalMonthlyCode) {
      finalMonthlyCode = Math.floor(10000000 + Math.random() * 90000000).toString()
    }

    // 2️⃣ Create User in Supabase Auth directly
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: targetRole,
        monthly_admin_code: targetRole === 'admin' ? finalMonthlyCode : null,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Account successfully created as [${targetRole.toUpperCase()}]!`,
      user: data.user,
      monthlyCode: finalMonthlyCode,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}