import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDynamic2FACode } from '@/lib/auth-utils'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const isGod = cookieHeader.includes('paimana_godmode=true')
    const isAdmin = cookieHeader.includes('paimana_session=true')

    if (!isGod && !isAdmin) {
      return NextResponse.json({ error: 'UNAUTHORIZED ACCESS' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, role, department, secretKey } = body

    if (!email || !password || !role || !secretKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 🛡️ DUAL SECRETS
    const SUPER_ADMIN_SECRET = process.env.MOSPI_SUPER_ADMIN_SECRET // Super Admin master key
    const DAILY_2FA = getDynamic2FACode() // Dynamic rotating 2FA code

    // 🛡️ ROLE-BASED PRIVILEGE ENFORCEMENT
    if (isGod) {
      // 1. SUPER ADMIN RULES (Can create both 'admin' and 'officer')
      if (secretKey !== SUPER_ADMIN_SECRET) {
        return NextResponse.json(
          { error: 'GOD MODE FAILED: Invalid Super Admin Master Key.' }, 
          { status: 403 }
        )
      }
    } else if (isAdmin) {
      // 2. NORMAL ADMIN RULES (Can ONLY create 'officer')
      if (role !== 'officer') {
        return NextResponse.json(
          { error: 'SECURITY BREACH: Privilege Escalation Blocked. Admins can only provision Officers.' }, 
          { status: 403 }
        )
      }

      if (secretKey !== DAILY_2FA) {
        return NextResponse.json(
          { error: 'PROVISIONING FAILED: Invalid or Expired Daily 2FA Code.' }, 
          { status: 403 }
        )
      }
    }

    // 🆕 Generate 8-Digit Monthly Code automatically if new user is an 'admin'
    const initialMonthlyCode = role === 'admin' 
      ? Math.floor(10000000 + Math.random() * 90000000).toString() 
      : null

    // 🚀 Create user in Supabase Auth with complete JWT metadata
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
      user_metadata: { 
        role: role, 
        department: department || 'MoSPI Department',
        monthly_admin_code: initialMonthlyCode, // 8-digit code for Admin
        cipher_code: initialMonthlyCode,        // Fallback key for compatibility
        created_by: isGod ? 'super_admin' : 'admin'
      }
    })

    if (error) throw error

    return NextResponse.json(
      { 
        message: `Account (${role.toUpperCase()}) Provisioned Successfully!`, 
        user: data.user,
        monthlyCode: initialMonthlyCode // Super Admin screen par dikhane ke liye
      },
      { status: 201 }
    )

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}