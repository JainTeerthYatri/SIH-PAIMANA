import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🛡️ Creating a God-Mode Supabase Client using Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // 1. Extra Security Check: Make sure only Super Admin is calling this API
    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('paimana_godmode=true')) {
      return NextResponse.json({ error: 'UNAUTHORIZED ACCESS' }, { status: 403 })
    }

    // 2. Fetch all real users from Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      throw error
    }

    // 3. Send real data to frontend
    return NextResponse.json({ users: data.users }, { status: 200 })

  } catch (error: any) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}