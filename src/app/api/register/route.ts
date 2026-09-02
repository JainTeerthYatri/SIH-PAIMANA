import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, secretKey } = body

    if (!email || !password || !secretKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Domain Restriction Security
    if (!email.endsWith('@mospi.gov.in') && !email.endsWith('@nic.in')) {
      return NextResponse.json(
        { error: 'SECURITY ALERT: Only official @mospi.gov.in or @nic.in domains are permitted.' },
        { status: 403 }
      )
    }

    // 🛡️ THE RBAC LOGIC (Role-Based Access Control)
    const NORMAL_SECRET = process.env.MOSPI_ADMIN_SECRET
    const SUPER_SECRET = process.env.MOSPI_SUPER_ADMIN_SECRET

    let assignedRole = ''

    if (secretKey === SUPER_SECRET) {
      assignedRole = 'super_admin'
    } else if (secretKey === NORMAL_SECRET) {
      assignedRole = 'admin'
    } else {
      return NextResponse.json(
        { error: 'ACCESS DENIED: Invalid Ministry Authorization Key.' },
        { status: 403 }
      )
    }

    // ✅ Supabase account creation with hidden User Metadata (Role)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: assignedRole // Supabase database mein chhup jayega ki ye super admin hai
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return the role so frontend knows where to redirect
    return NextResponse.json(
      { 
        message: assignedRole === 'super_admin' 
          ? 'Super Admin Master Account Created!' 
          : 'Officer Account Created Successfully!',
        role: assignedRole 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}