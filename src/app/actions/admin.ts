'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Secure 8-digit cryptographic code generator
export async function regenerateAdminCode(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Requires service role for admin API
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Generate cryptographic 8-digit code
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const newCode = (10000000 + (array[0] % 90000000)).toString();

  // Update user raw_user_meta_data in Supabase Auth
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { monthly_admin_code: newCode }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, newCode }
}