import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Only Super Admin can regenerate monthly admin keys
    if (!cookieHeader.includes('paimana_godmode=true')) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Super Admin required' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 1. Generate new 8-digit random monthly key
    const newMonthlyCode = Math.floor(10000000 + Math.random() * 90000000).toString()

    // 2. Fetch existing user metadata
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (fetchError || !userData.user) throw new Error('User not found')

    // 3. Update user_metadata with new key
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        monthly_admin_code: newMonthlyCode,
        cipher_code: newMonthlyCode,
        key_updated_at: new Date().toISOString()
      }
    })

    if (updateError) throw updateError

    return NextResponse.json({
      message: 'New 8-digit monthly key generated successfully!',
      newCode: newMonthlyCode
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}