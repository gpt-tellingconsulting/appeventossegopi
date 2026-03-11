import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'eventos.segopi.es',
  port: 5433,
  database: 'postgres',
  user: 'supabase_admin',
  password: 'AgotosaRV7hA5uR3vyCH844hgI8Gj1OL',
  ssl: false,
})

async function run() {
  await client.connect()
  console.log('Connected to database')

  // Step 1: Create companies table
  console.log('\n--- Step 1: Create companies table ---')
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.companies (
      company_code integer PRIMARY KEY,
      name text NOT NULL,
      cif text NOT NULL,
      fiscal_address text,
      physical_address text,
      email text,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  `)
  console.log('OK: companies table created')

  // Step 2: Evolve profiles
  console.log('\n--- Step 2: Evolve profiles table ---')
  await client.query(`
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'user';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_access integer[] DEFAULT '{}';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
  `)
  console.log('OK: profiles evolved')

  // Add check constraint (ignore if already exists)
  try {
    await client.query(`
      ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('admin', 'user'));
    `)
    console.log('OK: user_type check constraint added')
  } catch (e) {
    console.log('SKIP: user_type check constraint already exists')
  }

  // Migrate admin user
  await client.query(`
    UPDATE public.profiles
    SET user_type = 'admin', first_name = 'Telling', last_name = 'Consulting', is_active = true
    WHERE email = 'gpt@tellingconsulting.es';
  `)
  console.log('OK: admin user migrated')

  // Step 3: Add company_code to events
  console.log('\n--- Step 3: Add company_code to events ---')
  await client.query(`
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS company_code integer REFERENCES public.companies(company_code);
  `)
  console.log('OK: company_code added to events')

  // Step 4: Create SECURITY DEFINER functions
  console.log('\n--- Step 4: Create SECURITY DEFINER functions ---')
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_user_type()
    RETURNS TEXT
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = public
    AS $$
      SELECT user_type FROM profiles WHERE id = auth.uid();
    $$;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_user_company_access()
    RETURNS integer[]
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = public
    AS $$
      SELECT company_access FROM profiles WHERE id = auth.uid();
    $$;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION public.user_can_access_company(code integer)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (user_type = 'admin' OR code = ANY(company_access))
      );
    $$;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION public.user_can_access_event(eid uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = eid
        AND (
          public.get_user_type() = 'admin'
          OR e.company_code = ANY(public.get_user_company_access())
          OR e.company_code IS NULL
        )
      );
    $$;
  `)
  console.log('OK: SECURITY DEFINER functions created')

  // Step 5: Drop ALL existing policies
  console.log('\n--- Step 5: Drop all existing RLS policies ---')
  const dropPolicies = [
    'DROP POLICY IF EXISTS "Users read own profile" ON profiles',
    'DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles',
    'DROP POLICY IF EXISTS "Published events are publicly readable" ON events',
    'DROP POLICY IF EXISTS "Admins and organizers manage events" ON events',
    'DROP POLICY IF EXISTS "Anyone can insert registrations" ON registrations',
    'DROP POLICY IF EXISTS "Admins and organizers read registrations" ON registrations',
    'DROP POLICY IF EXISTS "Admins and organizers update registrations" ON registrations',
    'DROP POLICY IF EXISTS "Anyone can insert consents" ON consents',
    'DROP POLICY IF EXISTS "Admins read consents" ON consents',
    'DROP POLICY IF EXISTS "Anyone can update consents" ON consents',
    'DROP POLICY IF EXISTS "Anyone can insert suppression" ON suppression_list',
    'DROP POLICY IF EXISTS "Admins manage suppression list" ON suppression_list',
    'DROP POLICY IF EXISTS "Admins manage workflows" ON workflow_definitions',
    'DROP POLICY IF EXISTS "Admins manage workflow executions" ON workflow_executions',
    'DROP POLICY IF EXISTS "Anyone can insert workflow executions" ON workflow_executions',
    'DROP POLICY IF EXISTS "Anyone can update workflow executions" ON workflow_executions',
    'DROP POLICY IF EXISTS "Admins manage raffles" ON raffles',
    'DROP POLICY IF EXISTS "Admins manage raffle entries" ON raffle_entries',
    'DROP POLICY IF EXISTS "Admins read metrics" ON event_metrics',
    'DROP POLICY IF EXISTS "Public can read active prizes" ON event_prizes',
    'DROP POLICY IF EXISTS "Admins manage prizes" ON event_prizes',
    // Also drop new-named policies in case of re-run
    'DROP POLICY IF EXISTS "Anyone authenticated can read accessible companies" ON companies',
    'DROP POLICY IF EXISTS "Admins manage companies" ON companies',
    'DROP POLICY IF EXISTS "Auth users manage accessible events" ON events',
    'DROP POLICY IF EXISTS "Auth users read accessible registrations" ON registrations',
    'DROP POLICY IF EXISTS "Auth users update accessible registrations" ON registrations',
    'DROP POLICY IF EXISTS "Auth users read accessible consents" ON consents',
    'DROP POLICY IF EXISTS "Auth users read workflow definitions" ON workflow_definitions',
    'DROP POLICY IF EXISTS "Auth users read accessible workflow executions" ON workflow_executions',
    'DROP POLICY IF EXISTS "Auth users manage accessible workflow executions" ON workflow_executions',
    'DROP POLICY IF EXISTS "Auth users manage accessible raffles" ON raffles',
    'DROP POLICY IF EXISTS "Auth users manage accessible raffle entries" ON raffle_entries',
    'DROP POLICY IF EXISTS "Auth users read accessible metrics" ON event_metrics',
    'DROP POLICY IF EXISTS "Auth users manage accessible prizes" ON event_prizes',
  ]
  for (const sql of dropPolicies) {
    await client.query(sql)
  }
  console.log('OK: All existing policies dropped')

  // Step 6: Create new RLS policies
  console.log('\n--- Step 6: Create new RLS policies ---')

  // COMPANIES
  await client.query(`
    CREATE POLICY "Anyone authenticated can read accessible companies"
      ON companies FOR SELECT
      USING (
        public.get_user_type() = 'admin'
        OR company_code = ANY(public.get_user_company_access())
      );
  `)
  await client.query(`
    CREATE POLICY "Admins manage companies"
      ON companies FOR ALL
      USING (public.get_user_type() = 'admin');
  `)
  console.log('OK: companies policies')

  // PROFILES
  await client.query(`
    CREATE POLICY "Users read own profile"
      ON profiles FOR SELECT
      USING (id = auth.uid());
  `)
  await client.query(`
    CREATE POLICY "Admins manage all profiles"
      ON profiles FOR ALL
      USING (public.get_user_type() = 'admin');
  `)
  console.log('OK: profiles policies')

  // EVENTS
  await client.query(`
    CREATE POLICY "Published events are publicly readable"
      ON events FOR SELECT
      USING (status IN ('published', 'closed'));
  `)
  await client.query(`
    CREATE POLICY "Auth users manage accessible events"
      ON events FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR company_code = ANY(public.get_user_company_access())
        OR company_code IS NULL
      );
  `)
  console.log('OK: events policies')

  // REGISTRATIONS
  await client.query(`
    CREATE POLICY "Anyone can insert registrations"
      ON registrations FOR INSERT
      WITH CHECK (true);
  `)
  await client.query(`
    CREATE POLICY "Auth users read accessible registrations"
      ON registrations FOR SELECT
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  await client.query(`
    CREATE POLICY "Auth users update accessible registrations"
      ON registrations FOR UPDATE
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  console.log('OK: registrations policies')

  // CONSENTS
  await client.query(`
    CREATE POLICY "Anyone can insert consents"
      ON consents FOR INSERT
      WITH CHECK (true);
  `)
  await client.query(`
    CREATE POLICY "Auth users read accessible consents"
      ON consents FOR SELECT
      USING (
        public.get_user_type() = 'admin'
        OR EXISTS (
          SELECT 1 FROM registrations r
          WHERE r.id = registration_id
          AND public.user_can_access_event(r.event_id)
        )
      );
  `)
  await client.query(`
    CREATE POLICY "Anyone can update consents"
      ON consents FOR UPDATE
      WITH CHECK (true);
  `)
  console.log('OK: consents policies')

  // SUPPRESSION LIST
  await client.query(`
    CREATE POLICY "Anyone can insert suppression"
      ON suppression_list FOR INSERT
      WITH CHECK (true);
  `)
  await client.query(`
    CREATE POLICY "Admins manage suppression list"
      ON suppression_list FOR ALL
      USING (public.get_user_type() = 'admin');
  `)
  console.log('OK: suppression_list policies')

  // WORKFLOW DEFINITIONS
  await client.query(`
    CREATE POLICY "Auth users read workflow definitions"
      ON workflow_definitions FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR public.get_user_type() = 'user'
      );
  `)
  console.log('OK: workflow_definitions policies')

  // WORKFLOW EXECUTIONS
  await client.query(`
    CREATE POLICY "Auth users read accessible workflow executions"
      ON workflow_executions FOR SELECT
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  await client.query(`
    CREATE POLICY "Auth users manage accessible workflow executions"
      ON workflow_executions FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  await client.query(`
    CREATE POLICY "Anyone can insert workflow executions"
      ON workflow_executions FOR INSERT
      WITH CHECK (true);
  `)
  await client.query(`
    CREATE POLICY "Anyone can update workflow executions"
      ON workflow_executions FOR UPDATE
      WITH CHECK (true);
  `)
  console.log('OK: workflow_executions policies')

  // RAFFLES
  await client.query(`
    CREATE POLICY "Auth users manage accessible raffles"
      ON raffles FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  console.log('OK: raffles policies')

  // RAFFLE ENTRIES
  await client.query(`
    CREATE POLICY "Auth users manage accessible raffle entries"
      ON raffle_entries FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR EXISTS (
          SELECT 1 FROM raffles r
          WHERE r.id = raffle_id
          AND public.user_can_access_event(r.event_id)
        )
      );
  `)
  console.log('OK: raffle_entries policies')

  // EVENT METRICS
  await client.query(`
    CREATE POLICY "Auth users read accessible metrics"
      ON event_metrics FOR SELECT
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  console.log('OK: event_metrics policies')

  // EVENT PRIZES
  await client.query(`
    CREATE POLICY "Public can read active prizes"
      ON event_prizes FOR SELECT
      USING (is_active = true);
  `)
  await client.query(`
    CREATE POLICY "Auth users manage accessible prizes"
      ON event_prizes FOR ALL
      USING (
        public.get_user_type() = 'admin'
        OR public.user_can_access_event(event_id)
      );
  `)
  console.log('OK: event_prizes policies')

  // Step 7: Seed companies
  console.log('\n--- Step 7: Seed companies ---')
  await client.query(`
    INSERT INTO public.companies (company_code, name, cif, fiscal_address, physical_address, email) VALUES
    (1, 'CLEMENTE GONZALEZ, S.L.', 'B40104689', 'C/Guadarrama 11 40006 Segovia', 'C/Guadarrama 11 40006 Segovia', 'eventos@segopi.es'),
    (2, 'SEGOPI CENTRO, S.L.', 'B78295300', 'C/ San Roque N.37, 28440 Guadarrama (MADRID)', 'Polig. Ind. La Capellania 28411 Moralzarzal (Madrid)', 'eventos@segopi.es'),
    (3, 'SUMINISTROS SANTA TERESA, S.L.', 'B05114673', 'CL Rio Eresma, 7 PG Las Hervencias 05004 Avila', 'Avda Madrid 96 05001 Avila', 'eventos@segopi.es'),
    (4, 'SEGOPI, S.L.', 'B40031783', 'C/ TURQUESA, 44 47012 Valladolid', 'C/ TURQUESA, 44 47012 Valladolid', 'eventos@segopi.es'),
    (5, 'MOBILIARIO URBANO Y PARQUES CASTILLA, SLU', 'B85213304', 'Polig. Ind. La Capellania 28411 Moralzarzal (Madrid)', 'Calle Alamo, 123 Pol.Ind.Nicomedes Garcia, 40140 Valverde del Majano (Segovia)', 'eventos@segopi.es'),
    (7, 'RADALKI ALQUILER, S.L.', 'B83607044', 'Polig. Ind. La Capellania 28411 Moralzarzal (Madrid)', 'C/Guadarrama 11 40006 Segovia', 'eventos@segopi.es'),
    (8, 'PINTUDAS DARAL, S.L.', 'B70781166', 'C/Brezo, N.3 40194 Palazuelos de Eresma (SEGOVIA)', 'CALLE OLIVO Sector A-2 Parcela C/1-7 Poligono Industrial Europa (SEGOVIA)', 'eventos@segopi.es'),
    (10, 'TELLING CONSULTING, S.L.', 'B40271926', 'C/ San Roque N.37, 28440 Guadarrama (MADRID)', 'C/Guadarrama 11 40006 Segovia', 'eventos@segopi.es'),
    (79, 'SALI SUMINISTROS, S.L.', 'B82221813', 'C/ San Roque N.37, 28440 Guadarrama (MADRID)', 'C/Guadarrama 11 40006 Segovia', 'eventos@segopi.es')
    ON CONFLICT (company_code) DO NOTHING;
  `)
  console.log('OK: 9 companies seeded')

  // Step 8: Update events with company codes
  console.log('\n--- Step 8: Update events with company codes ---')
  const r1 = await client.query(`UPDATE public.events SET company_code = 2 WHERE slug = 'Feria-SegopiCentro-2026' RETURNING id, title`)
  console.log('Feria Segopi Centro -> company 2:', r1.rows)
  const r2 = await client.query(`UPDATE public.events SET company_code = 3 WHERE slug = 'feria-segopi-avila-2026' RETURNING id, title`)
  console.log('Feria Segopi Avila -> company 3:', r2.rows)

  // Grant SELECT on companies to authenticated users
  await client.query(`GRANT SELECT ON public.companies TO authenticated;`)
  await client.query(`GRANT ALL ON public.companies TO authenticated;`)

  console.log('\n=== MIGRATION COMPLETE ===')

  // Verify
  const companies = await client.query('SELECT company_code, name FROM companies ORDER BY company_code')
  console.log('\nCompanies:', companies.rows)

  const events = await client.query('SELECT id, title, company_code FROM events')
  console.log('\nEvents:', events.rows)

  const profiles = await client.query('SELECT id, email, user_type, company_access, is_active FROM profiles')
  console.log('\nProfiles:', profiles.rows)

  await client.end()
}

run().catch(err => {
  console.error('ERROR:', err.message)
  client.end()
  process.exit(1)
})
