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

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Generate secure 8-digit random code
    const newCode = Math.floor(10000000 + Math.random() * 90000000).toString()

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { monthly_admin_code: newCode }
    })

    if (error) throw error

    return NextResponse.json({ success: true, newCode }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}