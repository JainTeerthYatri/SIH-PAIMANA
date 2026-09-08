import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin Client using Service Role Key (Required to modify roles & bypass client limitations)
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
    const { email, password, role, monthlyCode, secretKey } = body

    // 1️⃣ Verify Master Secret Key
    const expectedSecretKey = process.env.GODMODE_SECRET_KEY || process.env.NEXT_PUBLIC_GODMODE_SECRET_KEY

    if (!secretKey || secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Admin Secret Key.' },
        { status: 401 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required fields.' },
        { status: 400 }
      )
    }

    const targetRole = role || 'officer'

    // 2️⃣ Generate 8-Digit Cipher for Admin if not provided
    let finalMonthlyCode = monthlyCode
    if (targetRole === 'admin' && !finalMonthlyCode) {
      finalMonthlyCode = Math.floor(10000000 + Math.random() * 90000000).toString()
    }

    // 3️⃣ Create User in Supabase Auth with dynamic role metadata
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirms email for instant login
      user_metadata: {
        role: targetRole, // Sets 'admin', 'officer', or 'super_admin' dynamically
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