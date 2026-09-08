import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''

    // Allow both Admin (paimana_session) & Super Admin (paimana_godmode)
    if (!cookieHeader.includes('paimana_session=true') && !cookieHeader.includes('paimana_godmode=true')) {
      return NextResponse.json({ error: 'UNAUTHORIZED ACCESS' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) throw error

    // Formatted data for frontend
    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email || 'N/A',
      role: u.user_metadata?.role || 'officer',
      department: u.user_metadata?.department || 'MoSPI Department',
      status: u.email_confirmed_at ? 'Active' : 'Pending',
      createdAt: u.created_at,
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}