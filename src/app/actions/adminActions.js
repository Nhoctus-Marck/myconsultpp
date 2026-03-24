'use server'
import { createClient } from '@supabase/supabase-js'

export async function registerEmployee(userData) {
  // USAMOS LA SERVICE_ROLE_KEY (pégala en tu .env.local)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Crear el usuario en Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    user_metadata: { full_name: userData.firstName },
    email_confirm: true // Se confirma solo para que el empleado entre directo
  })

  if (error) return { error: error.message }

  // 2. Insertar el rol en tu tabla memberships
  const { error: roleError } = await supabaseAdmin
    .from('memberships')
    .insert({ id: data.user.id, role: 'empleado' })

  if (roleError) return { error: roleError.message }

  return { success: true }
}