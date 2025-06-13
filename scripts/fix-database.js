require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPolicies() {
  try {
    console.log('Fixing database policies...');

    // Fix Swiss config policies
    const swissConfigPolicies = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.competition_swiss_config;
      DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.competition_swiss_config;
      DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.competition_swiss_config;
      DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.competition_swiss_config;
      DROP POLICY IF EXISTS "Enable write access for admins" ON public.competition_swiss_config;

      -- Create new policies
      CREATE POLICY "Enable read access for authenticated users" ON public.competition_swiss_config
        FOR SELECT USING (auth.role() = 'authenticated');

      CREATE POLICY "Enable write access for admins" ON public.competition_swiss_config
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
          )
        );
    `;

    // Fix competition teams policies
    const competitionTeamsPolicies = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Enable full access for admins" ON public.competition_teams;
      
      -- Create new policy
      CREATE POLICY "Enable full access for admins"
        ON public.competition_teams FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
          )
        );
    `;

    // Fix competitions policies
    const competitionsPolicies = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Competitions can be managed by admins" ON public.competitions;
      
      -- Create new policy
      CREATE POLICY "Competitions can be managed by admins"
        ON public.competitions FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
          )
        );
    `;

    // Fix matches policies
    const matchesPolicies = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Matches can be managed by admins" ON public.matches;
      
      -- Create new policy
      CREATE POLICY "Matches can be managed by admins"
        ON public.matches FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
          )
        );
    `;

    // Fix system settings policies
    const systemSettingsPolicies = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Allow admins full access to system settings" ON public.system_settings;
      
      -- Create new policy
      CREATE POLICY "Allow admins full access to system settings"
        ON public.system_settings FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
          )
        );
    `;

    // Execute all policy updates
    const { error: swissError } = await supabase.rpc('exec_sql', { sql: swissConfigPolicies });
    if (swissError) throw swissError;

    const { error: teamsError } = await supabase.rpc('exec_sql', { sql: competitionTeamsPolicies });
    if (teamsError) throw teamsError;

    const { error: competitionsError } = await supabase.rpc('exec_sql', { sql: competitionsPolicies });
    if (competitionsError) throw competitionsError;

    const { error: matchesError } = await supabase.rpc('exec_sql', { sql: matchesPolicies });
    if (matchesError) throw matchesError;

    const { error: settingsError } = await supabase.rpc('exec_sql', { sql: systemSettingsPolicies });
    if (settingsError) throw settingsError;

    console.log('✅ Successfully fixed database policies');
  } catch (error) {
    console.error('Error fixing database policies:', error);
    throw error;
  }
}

fixPolicies()
  .catch(console.error); 