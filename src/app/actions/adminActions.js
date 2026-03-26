'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function registerEmployee(userData) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'No autorizado' }

  const { data: adminMemberships } = await supabase
    .from('memberships')
    .select('clinic_id')
    .eq('user_id', currentUser.id)
    .eq('role', 'admin')

  const allowedClinics = adminMemberships?.map(m => m.clinic_id) || []
  if (!allowedClinics.includes(userData.clinicId)) {
    return { error: 'No tienes permisos para agregar usuarios a esta clínica' }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    user_metadata: { full_name: userData.firstName },
    email_confirm: true
  })

  if (error) return { error: error.message }

  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({ 
      id: data.user.id, 
      email: userData.email,
      name: userData.firstName
    })

  console.log("User insert error:", userError);

  if (userError) return { error: userError.message }

  const { error: roleError } = await supabaseAdmin
    .from('memberships')
    .insert({ 
      user_id: data.user.id, 
      clinic_id: userData.clinicId, 
      role: userData.role 
    })

  if (roleError) return { error: roleError.message }

  if (userData.role === 'doctor') {
    const { error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({ 
        user_id: data.user.id, 
        clinic_id: userData.clinicId,
        specialty: userData.specialty,
        license_number: userData.licenseNumber
      })

    if (doctorError) return { error: doctorError.message }
  }

  return { success: true }
}