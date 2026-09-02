import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('paimana_godmode=true')) {
      return NextResponse.json({ error: 'UNAUTHORIZED ACCESS' }, { status: 403 })
    }

    const { userId, newPassword } = await request.json()
    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Password reset successfully!' }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}