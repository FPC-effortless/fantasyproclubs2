-- Create trophies table
CREATE TABLE trophies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('team', 'individual')),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trophy_awards table
CREATE TABLE trophy_awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trophy_id UUID REFERENCES trophies(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL, -- Can reference either teams or players
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  season TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trophies_competition ON trophies(competition_id);
CREATE INDEX idx_trophy_awards_trophy ON trophy_awards(trophy_id);
CREATE INDEX idx_trophy_awards_competition ON trophy_awards(competition_id);
CREATE INDEX idx_trophy_awards_recipient ON trophy_awards(recipient_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trophies_updated_at
  BEFORE UPDATE ON trophies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trophy_awards_updated_at
  BEFORE UPDATE ON trophy_awards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 