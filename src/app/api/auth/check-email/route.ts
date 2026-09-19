import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const user = data.users.find((u) => u.email?.toLowerCase() === normalized)

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const raw = (user.user_metadata?.role as string) || 'officer'
    const role = ['officer', 'admin', 'super_admin'].includes(raw) ? raw : 'officer'

    return NextResponse.json({
      exists: true,
      role,
      email: user.email,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}