'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function regenerateAdminCode(userId: string) {
  // Await the cookies function in Next.js app router
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const newCode = (10000000 + (array[0] % 90000000)).toString();

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { monthly_admin_code: newCode }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, newCode }
}