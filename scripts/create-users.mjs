import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://supabase-api.segopi.es',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6MjIwODk4ODgwMH0.VgceFoQMXOVKX2A_TVHl9DTpVhoD3WIX4aKQJikFJl8',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const users = [
  {
    email: 'eduardog@segopi.com',
    password: 'Segopi2026Edu!',
    first_name: 'Eduardo',
    last_name: 'Garcia',
    user_type: 'user',
    company_access: [2],
  },
  {
    email: 'gvaras@segopi.es',
    password: 'Segopi2026Gus!',
    first_name: 'Gustavo',
    last_name: 'Varas',
    user_type: 'user',
    company_access: [3],
  },
]

async function run() {
  // Verify admin user is correctly set
  console.log('--- Checking admin user ---')
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, email, user_type, company_access, first_name, last_name')
    .eq('email', 'gpt@tellingconsulting.es')
    .single()
  console.log('Admin profile:', adminProfile)

  for (const u of users) {
    console.log(`\n--- Creating user: ${u.email} ---`)

    // Check if already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', u.email)
      .single()

    if (existing) {
      console.log(`SKIP: ${u.email} already exists (id: ${existing.id})`)
      // Update profile fields
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: u.first_name,
          last_name: u.last_name,
          full_name: `${u.first_name} ${u.last_name}`,
          user_type: u.user_type,
          company_access: u.company_access,
          is_active: true,
        })
        .eq('id', existing.id)
      if (updateError) console.log('  Update error:', updateError.message)
      else console.log('  Profile updated successfully')
      continue
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    })

    if (authError) {
      console.log(`ERROR creating auth user: ${authError.message}`)
      continue
    }

    console.log(`Auth user created: ${authData.user.id}`)

    // Update profile (auto-created by trigger)
    // Small delay to let the trigger fire
    await new Promise(r => setTimeout(r, 1000))

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: u.first_name,
        last_name: u.last_name,
        full_name: `${u.first_name} ${u.last_name}`,
        user_type: u.user_type,
        company_access: u.company_access,
        is_active: true,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.log(`ERROR updating profile: ${profileError.message}`)
    } else {
      console.log(`Profile updated: ${u.first_name} ${u.last_name}, type=${u.user_type}, companies=${u.company_access}`)
      console.log(`Password: ${u.password}`)
    }
  }

  // Final verification
  console.log('\n--- Final Verification ---')
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, user_type, company_access, is_active')
    .order('created_at')
  console.log('All profiles:', allProfiles)
}

run().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})
