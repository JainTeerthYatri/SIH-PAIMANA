import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, password, secretKey } = await req.json()

    if (secretKey !== process.env.MOSPI_SUPER_ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid Master Authorization Secret Key.' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (error) throw error

    const role = data.user?.user_metadata?.role
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Account lacks Super Admin clearance.' }, { status: 403 })
    }

    return NextResponse.json({ success: true, role }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}