-- Create Swiss configuration table
CREATE TABLE IF NOT EXISTS public.swiss_model_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  number_of_teams INTEGER NOT NULL CHECK (number_of_teams BETWEEN 4 AND 64),
  matches_per_team INTEGER NOT NULL CHECK (matches_per_team BETWEEN 3 AND 10),
  same_country_restriction BOOLEAN NOT NULL DEFAULT true,
  home_away_balance BOOLEAN NOT NULL DEFAULT true,
  direct_qualifiers INTEGER NOT NULL CHECK (direct_qualifiers >= 0),
  playoff_qualifiers INTEGER NOT NULL CHECK (playoff_qualifiers >= 0),
  tiebreakers TEXT[] NOT NULL DEFAULT ARRAY['points', 'goal_difference', 'goals_for', 'head_to_head', 'initial_seed'],
  exclusions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.swiss_model_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for Swiss configuration
CREATE POLICY "Enable read access for authenticated users" ON public.swiss_model_configs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admins" ON public.swiss_model_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON public.swiss_model_configs TO authenticated;
GRANT ALL ON public.swiss_model_configs TO service_role;

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.swiss_model_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 